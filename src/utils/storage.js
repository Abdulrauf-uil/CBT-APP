// ============================================================
//  CBT App – localStorage Utility
// ============================================================

const KEYS = {
  ADMIN: 'cbt_admin',
  STUDENTS: 'cbt_students',
  TESTS: 'cbt_tests',
  RESULTS: 'cbt_results',
  GROUPS: 'cbt_groups',
  STUDENT_SESSION: 'cbt_student_session',
  ADMIN_SESSION: 'cbt_admin_session',
};

// ──────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────
const get = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ──────────────────────────────────────────────────────────────
//  Admin Credentials
// ──────────────────────────────────────────────────────────────
const DEFAULT_ADMIN = { username: 'admin', password: 'admin911' };

export const getAdmin = () => get(KEYS.ADMIN) ?? DEFAULT_ADMIN;

export const updateAdmin = (updated) => set(KEYS.ADMIN, updated);

export const validateAdmin = (username, password) => {
  const admin = getAdmin();
  return admin.username === username && admin.password === password;
};

// Admin session
export const setAdminSession = () => set(KEYS.ADMIN_SESSION, { loggedIn: true, at: Date.now() });
export const clearAdminSession = () => localStorage.removeItem(KEYS.ADMIN_SESSION);
export const isAdminLoggedIn = () => !!get(KEYS.ADMIN_SESSION)?.loggedIn;

// ──────────────────────────────────────────────────────────────
//  Groups
// ──────────────────────────────────────────────────────────────
// A group is just { id, name, createdAt }
export const getGroups = () => get(KEYS.GROUPS) ?? [];

export const addGroup = (name) => {
  const groups = getGroups();
  const newGroup = { id: crypto.randomUUID(), name, createdAt: Date.now() };
  set(KEYS.GROUPS, [...groups, newGroup]);
  return newGroup;
};

export const deleteGroup = (id) => {
  set(KEYS.GROUPS, getGroups().filter((g) => g.id !== id));
  // Optional: Also remove this groupId from any students that have it
};

// ──────────────────────────────────────────────────────────────
//  Students
// ──────────────────────────────────────────────────────────────
export const getStudents = () => get(KEYS.STUDENTS) ?? [];

export const addStudent = (student) => {
  const students = getStudents();
  // student should now optionally include `groupId`
  const newStudent = { ...student, id: crypto.randomUUID(), createdAt: Date.now() };
  set(KEYS.STUDENTS, [...students, newStudent]);
  return newStudent;
};

export const removeStudent = (id) => {
  set(KEYS.STUDENTS, getStudents().filter((s) => s.id !== id));
};

export const validateStudent = (email, password) => {
  const students = getStudents();
  return students.find((s) => s.email === email && s.password === password) ?? null;
};

// Student session
export const setStudentSession = (student) => set(KEYS.STUDENT_SESSION, student);
export const clearStudentSession = () => localStorage.removeItem(KEYS.STUDENT_SESSION);
export const getStudentSession = () => get(KEYS.STUDENT_SESSION);

// ──────────────────────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────────────────────
export const getTests = () => get(KEYS.TESTS) ?? [];

export const getTestById = (id) => getTests().find((t) => t.id === id) ?? null;

export const addTest = (test) => {
  const tests = getTests();
  // test should now include `groupId` (or 'all')
  const newTest = { ...test, id: crypto.randomUUID(), createdAt: Date.now(), isOpen: true };
  set(KEYS.TESTS, [...tests, newTest]);
  return newTest;
};

export const updateTest = (id, updatedFields) => {
  const tests = getTests();
  const updatedTests = tests.map(t => t.id === id ? { ...t, ...updatedFields } : t);
  set(KEYS.TESTS, updatedTests);
};

export const removeTest = (id) => {
  set(KEYS.TESTS, getTests().filter((t) => t.id !== id));
};

// ──────────────────────────────────────────────────────────────
//  Results
// ──────────────────────────────────────────────────────────────
export const getResults = () => get(KEYS.RESULTS) ?? [];

export const saveResult = (result) => {
  const results = getResults();
  const newResult = { ...result, id: crypto.randomUUID(), submittedAt: Date.now() };
  set(KEYS.RESULTS, [...results, newResult]);
  return newResult;
};

export const getResultsByStudent = (studentId) =>
  getResults().filter((r) => r.studentId === studentId);

export const getResultsByTest = (testId) =>
  getResults().filter((r) => r.testId === testId);
