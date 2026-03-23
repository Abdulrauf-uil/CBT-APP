// ============================================================
//  CBT App – Firebase Firestore Utility
// ============================================================
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';

const KEYS = {
  ADMIN: 'admin_settings',
  STUDENTS: 'students',
  TESTS: 'tests',
  RESULTS: 'results',
  GROUPS: 'groups',
  STUDENT_SESSION: 'cbt_student_session',
  ADMIN_SESSION: 'cbt_admin_session',
};

// ──────────────────────────────────────────────────────────────
//  Admin Credentials
// ──────────────────────────────────────────────────────────────
const DEFAULT_ADMIN = { username: 'admin', password: 'admin911' };

export const getAdmin = async () => {
  try {
    const adminDoc = await getDoc(doc(db, 'settings', KEYS.ADMIN));
    return adminDoc.exists() ? adminDoc.data() : DEFAULT_ADMIN;
  } catch (error) {
    console.error("Error fetching admin:", error);
    return DEFAULT_ADMIN;
  }
};

export const updateAdmin = async (updated) => {
  await setDoc(doc(db, 'settings', KEYS.ADMIN), updated);
};

export const validateAdmin = async (username, password) => {
  const admin = await getAdmin();
  return admin.username === username && admin.password === password;
};

// Admin session (Keep in localStorage for session persistence)
export const setAdminSession = () => localStorage.setItem(KEYS.ADMIN_SESSION, JSON.stringify({ loggedIn: true, at: Date.now() }));
export const clearAdminSession = () => localStorage.removeItem(KEYS.ADMIN_SESSION);
export const isAdminLoggedIn = () => {
  const session = localStorage.getItem(KEYS.ADMIN_SESSION);
  return session ? JSON.parse(session).loggedIn : false;
};

// ──────────────────────────────────────────────────────────────
//  Groups
// ──────────────────────────────────────────────────────────────
export const getGroups = async () => {
  const snap = await getDocs(query(collection(db, KEYS.GROUPS), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addGroup = async (name) => {
  const docRef = await addDoc(collection(db, KEYS.GROUPS), {
    name,
    createdAt: Date.now()
  });
  return { id: docRef.id, name };
};

export const deleteGroup = async (id) => {
  await deleteDoc(doc(db, KEYS.GROUPS, id));
};

// ──────────────────────────────────────────────────────────────
//  Students
// ──────────────────────────────────────────────────────────────
export const getStudents = async () => {
  const snap = await getDocs(query(collection(db, KEYS.STUDENTS), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addStudent = async (student) => {
  const docRef = await addDoc(collection(db, KEYS.STUDENTS), {
    ...student,
    createdAt: Date.now()
  });
  return { ...student, id: docRef.id };
};

export const removeStudent = async (id) => {
  await deleteDoc(doc(db, KEYS.STUDENTS, id));
};

export const validateStudent = async (email, password) => {
  const q = query(collection(db, KEYS.STUDENTS), where("email", "==", email), where("password", "==", password));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// Student session (Keep in localStorage)
export const setStudentSession = (student) => localStorage.setItem(KEYS.STUDENT_SESSION, JSON.stringify(student));
export const clearStudentSession = () => localStorage.removeItem(KEYS.STUDENT_SESSION);
export const getStudentSession = () => {
  const s = localStorage.getItem(KEYS.STUDENT_SESSION);
  return s ? JSON.parse(s) : null;
};

// ──────────────────────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────────────────────
export const getTests = async () => {
  const snap = await getDocs(query(collection(db, KEYS.TESTS), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getTestById = async (id) => {
  const d = await getDoc(doc(db, KEYS.TESTS, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};

export const addTest = async (test) => {
  const docRef = await addDoc(collection(db, KEYS.TESTS), {
    ...test,
    createdAt: Date.now(),
    isOpen: true
  });
  return { ...test, id: docRef.id };
};

export const updateTest = async (id, updatedFields) => {
  await updateDoc(doc(db, KEYS.TESTS, id), updatedFields);
};

export const removeTest = async (id) => {
  await deleteDoc(doc(db, KEYS.TESTS, id));
};

// ──────────────────────────────────────────────────────────────
//  Results
// ──────────────────────────────────────────────────────────────
export const getResults = async () => {
  const snap = await getDocs(query(collection(db, KEYS.RESULTS), orderBy('submittedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const saveResult = async (result) => {
  const docRef = await addDoc(collection(db, KEYS.RESULTS), {
    ...result,
    submittedAt: Date.now()
  });
  return { ...result, id: docRef.id };
};

export const getResultsByStudent = async (studentId) => {
  const q = query(collection(db, KEYS.RESULTS), where("studentId", "==", studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getResultsByTest = async (testId) => {
  const q = query(collection(db, KEYS.RESULTS), where("testId", "==", testId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const removeResult = async (id) => {
  await deleteDoc(doc(db, KEYS.RESULTS, id));
};

export const getResultById = async (id) => {
  const d = await getDoc(doc(db, KEYS.RESULTS, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};

// ──────────────────────────────────────────────────────────────
//  Migration Utility (One-time use)
// ──────────────────────────────────────────────────────────────
export const migrateToCloud = async () => {
  const localKeys = {
    TESTS: 'cbt_tests',
    STUDENTS: 'cbt_students',
    RESULTS: 'cbt_results',
    GROUPS: 'cbt_groups',
    ADMIN: 'cbt_admin'
  };

  const getLocal = (key) => {
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : [];
  };

  // Migrate Groups
  const localGroups = getLocal(localKeys.GROUPS);
  for (const g of localGroups) {
    await setDoc(doc(db, KEYS.GROUPS, g.id), { name: g.name, createdAt: g.createdAt || Date.now() });
  }

  // Migrate Students
  const localStudents = getLocal(localKeys.STUDENTS);
  for (const s of localStudents) {
    await setDoc(doc(db, KEYS.STUDENTS, s.id), { ...s, createdAt: s.createdAt || Date.now() });
  }

  // Migrate Tests
  const localTests = getLocal(localKeys.TESTS);
  for (const t of localTests) {
    await setDoc(doc(db, KEYS.TESTS, t.id), { ...t, createdAt: t.createdAt || Date.now(), isOpen: t.isOpen !== false });
  }

  // Migrate Results
  const localResults = getLocal(localKeys.RESULTS);
  for (const r of localResults) {
    await setDoc(doc(db, KEYS.RESULTS, r.id), { ...r, submittedAt: r.submittedAt || Date.now() });
  }

  console.log("Migration complete!");
};
