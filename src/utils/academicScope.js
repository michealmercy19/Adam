export const CURRENT_ACADEMIC_SESSION = '2026/2027';

export const normalizeScopeValue = (value = '') => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export const buildAcademicScopeKey = ({ department = '', programme = '', level = '', session = CURRENT_ACADEMIC_SESSION } = {}) => [department, programme, level, session].map(normalizeScopeValue).join('::');

export const buildAccountKey = ({ role = '', id = '' } = {}) => `${normalizeScopeValue(role)}:${normalizeScopeValue(id)}`;

export const createAcademicWorkspace = ({ department, programme, level, session = CURRENT_ACADEMIC_SESSION, createdBy = '' }) => ({
  id: buildAcademicScopeKey({ department, programme, level, session }),
  department,
  programme,
  level,
  session,
  hodAccountId: null,
  hocAccountId: null,
  status: 'active',
  settings: {},
  createdAt: new Date().toISOString(),
  createdBy,
  updatedAt: new Date().toISOString(),
});

export const createAuditEvent = ({ action, actorId, actorName, department = '', programme = '', level = '', session = CURRENT_ACADEMIC_SESSION, previousAssignment = null, newAssignment = null, recordId = '' }) => ({
  id: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  action,
  actorId,
  actorName,
  department,
  programme,
  level,
  session,
  previousAssignment,
  newAssignment,
  recordId,
  createdAt: new Date().toISOString(),
});
