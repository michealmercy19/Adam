import React, { useContext, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { AppContext } from '../../context/AppContext.jsx';
import { Badge, Card, Button } from '../common/UI.jsx';
import { buildAcademicScopeKey, createAcademicWorkspace, createAuditEvent, CURRENT_ACADEMIC_SESSION } from '../../utils/academicScope.js';

export default function AdminSettings() {
  const { currentRole, setCurrentRole, setCurrentPage, setRoleSelected, userProfile, studentRegistry, setStudentRegistry, academicWorkspaces, setAcademicWorkspaces, hocRequests, setHocRequests, auditEvents, setAuditEvents } = useContext(AppContext);
  const [registryPreview, setRegistryPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [showStepDown, setShowStepDown] = useState(false);
  const isAdmin = currentRole === 'admin';
  const scopeRecords = useMemo(() => Object.values(academicWorkspaces), [academicWorkspaces]);

  const parseRegistry = (text) => {
    const rows = String(text).split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
    const [headerRow, ...dataRows] = rows;
    const headers = headerRow.split(/[\t,]/).map((header) => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, ''));
    const indexOf = (...names) => headers.findIndex((header) => names.includes(header));
    const fields = {
      matricNumber: indexOf('matricnumber', 'matric', 'id'), fullName: indexOf('fullname', 'name'), institution: indexOf('institution'),
      college: indexOf('college', 'faculty'), department: indexOf('department', 'unit'), programme: indexOf('programme', 'program'),
      level: indexOf('level'), session: indexOf('academicsession', 'session'), status: indexOf('status'),
    };
    return dataRows.map((row) => {
      const columns = row.split(/[\t,]/).map((value) => value.trim());
      return Object.fromEntries(Object.entries(fields).map(([field, index]) => [field, columns[index] || '']));
    });
  };

  const uploadRegistry = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file || !/\.(csv|xlsx)$/i.test(file.name)) {
      setMessage('Upload a CSV or XLSX registry file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const workbook = /\.xlsx$/i.test(file.name) ? XLSX.read(loadEvent.target.result, { type: 'array' }) : null;
      const source = workbook ? XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]) : loadEvent.target.result;
      const records = parseRegistry(source);
      const seen = new Set();
      const preview = records.map((record, index) => {
        const missing = ['matricNumber', 'fullName', 'programme', 'level', 'session', 'status'].filter((field) => !record[field]);
        const duplicate = seen.has(record.matricNumber);
        seen.add(record.matricNumber);
        const validLevel = /^\d+\s*Level$/i.test(record.level);
        const validSession = /^\d{4}\/\d{4}$/.test(record.session);
        const validStatus = ['active', 'deferred', 'graduated', 'withdrawn'].includes(record.status.toLowerCase());
        return { ...record, id: `registry-${Date.now()}-${index}`, missing, duplicate, invalidLevel: !validLevel, invalidSession: !validSession, invalidStatus: !validStatus };
      });
      setRegistryPreview(preview);
    };
    if (/\.xlsx$/i.test(file.name)) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  const confirmRegistry = () => {
    if (!registryPreview) return;
    const valid = registryPreview.filter((record) => !record.missing.length && !record.duplicate && !record.invalidLevel && !record.invalidSession && !record.invalidStatus);
    setStudentRegistry((current) => [...current.filter((record) => !valid.some((item) => item.matricNumber === record.matricNumber && item.session === record.session)), ...valid]);
    setAcademicWorkspaces((current) => valid.reduce((workspaces, record) => {
      const id = buildAcademicScopeKey(record);
      return { ...workspaces, [id]: workspaces[id] || createAcademicWorkspace({ ...record, createdBy: userProfile?.id }) };
    }, current));
    setAuditEvents((current) => [createAuditEvent({ action: 'Student registry uploaded', actorId: userProfile?.id, actorName: userProfile?.name, department: userProfile?.department, recordId: `registry-import-${Date.now()}` }), ...current]);
    setMessage(`${valid.length} valid registry records imported. Invalid rows were excluded.`);
    setRegistryPreview(null);
  };

  const stepDown = () => {
    setAcademicWorkspaces((current) => Object.fromEntries(Object.entries(current).map(([key, workspace]) => workspace.hodAccountId === userProfile?.id ? [key, { ...workspace, hodAccountId: null, updatedAt: new Date().toISOString() }] : [key, workspace])));
    setAuditEvents((current) => [createAuditEvent({ action: 'HOD stepped down', actorId: userProfile?.id, actorName: userProfile?.name, department: userProfile?.department, programme: userProfile?.programme }), ...current]);
    setMessage('You have stepped down. The department workspace and records remain available to the next authorized HOD.');
    setCurrentRole('student');
    setCurrentPage('s-home');
    setRoleSelected(false);
    setShowStepDown(false);
  };

  const removeHoc = (workspace) => {
    if (!workspace.hocAccountId) return;
    setAcademicWorkspaces((current) => ({ ...current, [workspace.id]: { ...workspace, hocAccountId: null, updatedAt: new Date().toISOString() } }));
    setAuditEvents((current) => [createAuditEvent({ action: 'HOC removed', actorId: userProfile?.id, actorName: userProfile?.name, ...workspace, previousAssignment: workspace.hocAccountId }), ...current]);
    setMessage('HOC permissions removed. The programme workspace and course history remain intact.');
  };

  const approveHocRequest = (request, approved) => {
    const scopeKey = buildAcademicScopeKey(request);
    setHocRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: approved ? 'approved' : 'rejected', reviewedAt: new Date().toISOString(), approvedAt: approved ? new Date().toISOString() : undefined, reviewedBy: userProfile?.id } : item));
    if (approved) setAcademicWorkspaces((current) => ({ ...current, [scopeKey]: { ...(current[scopeKey] || createAcademicWorkspace({ ...request, createdBy: userProfile?.id })), hocAccountId: request.studentId, updatedAt: new Date().toISOString() } }));
    setAuditEvents((current) => [createAuditEvent({ action: approved ? 'HOC request approved' : 'HOC request rejected', actorId: userProfile?.id, actorName: userProfile?.name, ...request, previousAssignment: null, newAssignment: approved ? request.studentId : null }), ...current]);
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Settings</h1>
          <p>Admin-only system controls</p>
        </div>
      </div>

      <div className="system-overview">
        <div className="system-overview-heading">
          <div>
            <span className="eyebrow">System view</span>
            <h2>ADAM is ready</h2>
          </div>
          <Badge text="Operational" type="good" />
        </div>
        <div className="system-health-grid">
          <div><span>Attendance service</span><strong>Online</strong></div>
          <div><span>Biometric verification</span><strong>Protected</strong></div>
          <div><span>Last sync</span><strong>Just now</strong></div>
        </div>
      </div>

      <Card>
        <div className="statline">
          <span>Maximum attendance session</span>
          <b>35 min</b>
        </div>
        <div className="statline">
          <span>Default On Time</span>
          <b>10 min</b>
        </div>
        <div className="statline">
          <span>Default Late</span>
          <b>5 min</b>
        </div>
        <div className="statline">
          <span>Facial recognition</span>
          <Badge text="Enabled" type="good" />
        </div>
        <div className="statline">
          <span>Final biometrics</span>
          <Badge text="Required" type="good" />
        </div>
        <div className="statline">
          <span>Network fallback</span>
          <Badge text="Enabled" type="good" />
        </div>
      </Card>

      {isAdmin && <>
        <Card className="section">
          <div className="list-heading"><div><h3>Official student registry</h3><p className="muted">Upload, validate, preview, then confirm programme-scoped student records.</p></div><Badge text={`${studentRegistry.length} records`} type="good" /></div>
          <label className="upload-box compact-upload"><input type="file" accept=".csv,.xlsx" onChange={uploadRegistry} /><strong>Upload CSV or XLSX registry</strong><span>Required: matric, name, programme, level, session, status</span></label>
          {registryPreview && <div className="registry-preview"><p className="muted">Preview: {registryPreview.length} rows · {registryPreview.filter((row) => !row.missing.length && !row.duplicate && !row.invalidLevel && !row.invalidSession && !row.invalidStatus).length} valid · {registryPreview.filter((row) => row.duplicate).length} duplicates · {registryPreview.filter((row) => row.missing.length).length} missing fields</p><div className="actions"><Button type="ghost" onClick={() => setRegistryPreview(null)}>Cancel</Button><Button type="primary" onClick={confirmRegistry}>Confirm import</Button></div></div>}
        </Card>

        <Card className="section">
          <div className="list-heading"><div><h3>HOC requests</h3><p className="muted">Approve verified students into the existing programme workspace.</p></div><Badge text={`${hocRequests.filter((request) => request.status === 'pending').length} pending`} type="pending" /></div>
          {hocRequests.filter((request) => request.status === 'pending').map((request) => <div className="review-row" key={request.id}><div><b>{request.studentName}</b><span className="muted">{request.programme} · {request.level} · {request.session}</span></div><div className="actions"><Button type="primary" onClick={() => approveHocRequest(request, true)}>Approve</Button><Button type="danger" onClick={() => approveHocRequest(request, false)}>Reject</Button></div></div>)}
          {!hocRequests.some((request) => request.status === 'pending') && <p className="muted">No HOC requests are waiting for review.</p>}
        </Card>

        <Card className="section"><div className="list-heading"><div><h3>Academic workspaces</h3><p className="muted">Workspaces remain when leadership changes.</p></div><Badge text={`${scopeRecords.length} scopes`} type="good" /></div>{scopeRecords.map((workspace) => <div className="statline" key={workspace.id}><span>{workspace.programme || workspace.department} · {workspace.level} · {workspace.session}</span><span>{workspace.hocAccountId ? <><b>HOC assigned</b> <Button type="danger" onClick={() => removeHoc(workspace)}>Remove HOC</Button></> : <b>No HOC assigned</b>}</span></div>)}</Card>

        <Card className="section"><h3>HOD role</h3><p className="muted">Stepping down removes authority only. Department data, history, registry, courses, and notifications remain intact.</p><Button type="danger" onClick={() => setShowStepDown(true)}>Step down as HOD</Button></Card>
        {showStepDown && <div className="confirmation-overlay"><div className="confirmation-modal" role="dialog" aria-modal="true"><h3>Step down as HOD?</h3><p className="muted">You will lose access to HOD management features. Department records and history remain available to the next authorized HOD.</p><div className="actions"><Button type="ghost" onClick={() => setShowStepDown(false)}>Cancel</Button><Button type="danger" onClick={stepDown}>Confirm step down</Button></div></div></div>}
      </>}
      {message && <div className="section notice verification-banner"><div><strong>Update</strong><p>{message}</p></div></div>}
    </>
  );
}
