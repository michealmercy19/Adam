import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dataDirectory = path.join(projectRoot, 'server', 'data');
const stateFile = path.join(dataDirectory, 'state.json');
const port = Number(process.env.PORT || 3001);
const STATE_VERSION = 2;
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const emptyState = {
  _initialized: false,
  _version: STATE_VERSION,
  courseOfferings: [],
  studentCourseSelections: {},
  lecturerAssignments: {},
  activeClass: null,
  courseFormSubmissions: [],
  notifications: [],
  attendanceRecords: [],
  biometricEnrollments: {},
  hocCourseSelections: {},
  coursePermissionRequests: [],
  onboardedAccounts: {},
  academicWorkspaces: {},
  studentRegistry: [],
  hocRequests: [],
  auditEvents: [],
};

function getLevelNumber(level = '') {
  return String(level || '').match(/\d+/)?.[0] || '';
}

function getCourseLevelNumber(code = '') {
  return String(code || '').match(/^[A-Za-z]+\s*(\d)\d{2}\b/)?.[1] || '';
}

function sanitizeCourseSelection(courseIds, knownCourseIds) {
  if (!Array.isArray(courseIds)) return [];
  return [...new Set(courseIds.filter((id) => knownCourseIds.has(String(id))))];
}

function sanitizeState(input) {
  const nextState = { ...emptyState, ...input, _initialized: true, _version: STATE_VERSION };
  nextState.courseOfferings = Array.isArray(nextState.courseOfferings) ? nextState.courseOfferings.map((course) => ({
    ...course,
    id: String(course?.id ?? Date.now() + Math.random()),
    code: String(course?.code || '').trim().toUpperCase(),
    title: String(course?.title || '').trim(),
    department: String(course?.department || '').trim(),
    level: String(course?.level || '').trim(),
    verified: Boolean(course?.verified),
    carryover: Boolean(course?.carryover),
  })).filter((course) => course.code && course.title) : [];

  const knownCourseIds = new Set(nextState.courseOfferings.map((course) => String(course.id)));
  nextState.studentCourseSelections = Object.fromEntries(
    Object.entries(nextState.studentCourseSelections || {}).map(([studentId, courseIds]) => [studentId, sanitizeCourseSelection(courseIds, knownCourseIds)])
  );

  nextState.hocCourseSelections = Object.fromEntries(
    Object.entries(nextState.hocCourseSelections || {}).map(([key, selection]) => [key, {
      ...(selection || {}),
      courseIds: sanitizeCourseSelection(selection?.courseIds, knownCourseIds),
      draftCourseIds: sanitizeCourseSelection(selection?.draftCourseIds, knownCourseIds),
    }])
  );
  nextState.onboardedAccounts = Object.fromEntries(Object.entries(nextState.onboardedAccounts || {}).filter(([accountId, completed]) => accountId && completed === true));
  nextState.academicWorkspaces = Object.fromEntries(Object.entries(nextState.academicWorkspaces || {}).map(([key, workspace]) => [key, {
    ...(workspace || {}),
    id: String(workspace?.id || key),
    department: String(workspace?.department || '').trim(),
    programme: String(workspace?.programme || '').trim(),
    level: String(workspace?.level || '').trim(),
    session: String(workspace?.session || '').trim(),
    hodAccountId: workspace?.hodAccountId ? String(workspace.hodAccountId) : null,
    hocAccountId: workspace?.hocAccountId ? String(workspace.hocAccountId) : null,
  }]));
  nextState.studentRegistry = Array.isArray(nextState.studentRegistry) ? nextState.studentRegistry.map((record) => ({
    ...record,
    id: String(record?.id || `registry-${Date.now()}-${Math.random()}`),
    matricNumber: String(record?.matricNumber || '').trim(),
    fullName: String(record?.fullName || '').trim(),
    institution: String(record?.institution || '').trim(),
    college: String(record?.college || '').trim(),
    department: String(record?.department || '').trim(),
    programme: String(record?.programme || '').trim(),
    level: String(record?.level || '').trim(),
    session: String(record?.session || '').trim(),
    status: String(record?.status || 'active').trim().toLowerCase(),
  })).filter((record) => record.matricNumber && record.fullName && record.programme) : [];
  nextState.hocRequests = Array.isArray(nextState.hocRequests) ? nextState.hocRequests : [];
  nextState.auditEvents = Array.isArray(nextState.auditEvents) ? nextState.auditEvents : [];

  return nextState;
}

async function readState() {
  try {
    const savedState = JSON.parse(await fs.readFile(stateFile, 'utf8'));
    if (savedState._version !== STATE_VERSION) return emptyState;
    return { ...emptyState, ...savedState };
  } catch {
    return emptyState;
  }
}

async function writeState(state) {
  await fs.mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${stateFile}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify({ ...state, _initialized: true, _version: STATE_VERSION }, null, 2));
  await fs.rename(temporaryFile, stateFile);
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    });
    response.end();
    return;
  }

  if (request.url === '/api/state' && request.method === 'GET') {
    sendJson(response, 200, await readState());
    return;
  }

  if (request.url === '/api/state' && request.method === 'PUT') {
    let body = '';
    let tooLarge = false;
    request.on('data', (chunk) => { body += chunk; });
    request.on('data', () => {
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        tooLarge = true;
        request.destroy();
      }
    });
    request.on('end', async () => {
      if (tooLarge) return;
      try {
        const parsed = JSON.parse(body);
        const nextState = sanitizeState(parsed);
        await writeState(nextState);
        sendJson(response, 200, nextState);
      } catch {
        sendJson(response, 400, { error: 'Invalid state payload' });
      }
    });
    return;
  }

  if (request.url === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { ok: true, version: STATE_VERSION, timestamp: new Date().toISOString() });
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`ADAM server listening on http://localhost:${port}`);
});