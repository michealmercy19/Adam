import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAcademicScopeKey, buildAccountKey, createAcademicWorkspace } from '../src/utils/academicScope.js';

test('academic scope keeps programmes separate within one department', () => {
  assert.notEqual(
    buildAcademicScopeKey({ department: 'Computing', programme: 'ICT', level: '300 Level' }),
    buildAcademicScopeKey({ department: 'Computing', programme: 'IFT', level: '300 Level' }),
  );
});

test('account keys identify people independently from workspaces', () => {
  assert.equal(buildAccountKey({ role: 'student', id: '21/1234' }), 'student:21/1234');
  assert.notEqual(buildAccountKey({ role: 'hoc', id: '21/1234' }), buildAccountKey({ role: 'student', id: '21/1234' }));
});

test('workspace creation preserves academic ownership scope', () => {
  const workspace = createAcademicWorkspace({ department: 'Computing', programme: 'ICT', level: '300 Level', createdBy: 'admin-1' });
  assert.equal(workspace.hodAccountId, null);
  assert.equal(workspace.hocAccountId, null);
  assert.equal(workspace.programme, 'ICT');
  assert.equal(workspace.level, '300 Level');
});
