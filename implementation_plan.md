# Computer Based Test (CBT) Web App Implementation Plan

## Goal Description
Build a comprehensive Computer Based Test (CBT) web application. **Admins** can log in, manage registered students, and create/manage timed multiple-choice tests. **Students** must be registered by an admin first — they log in with their credentials and can then take available tests. Data is persisted via `localStorage`. Built as a fast SPA with React + Vite and premium Vanilla CSS.

## User Review Required

> [!IMPORTANT]
> **Access Control:** Only students registered by the Admin can log in and access tests. Admin credentials will be hardcoded (e.g., `admin` / `admin123`) with the ability to change it in settings later.
> 
> **Student credentials:** Admin sets a student's name, ID/email, and password during registration. The student uses those credentials to log in.
> 
> All data (students, tests, results) is stored in browser `localStorage`. A real backend can be integrated later.
> 
> Are there any other features you'd like to add (e.g., assigning specific tests to specific students, printing results, etc.)?

## Proposed Changes

### Project Foundation
- Initialize React project via Vite (`npx -y create-vite@latest . --template react`).
- Create a premium global CSS architecture.

### Core Components
#### [NEW] `src/App.jsx`
Main entry point handling routing between Admin and Student portals.

#### [NEW] `src/index.css`
Global styles, modern variables for theming, typography (e.g., Inter font), and premium styling (glassmorphism, subtle gradients).

### Features
#### [NEW] `src/pages/Home.jsx`
Landing page with two login portals: **Admin Login** and **Student Login**.

#### [NEW] `src/pages/admin/AdminLogin.jsx`
Admin login form (hardcoded credentials, stored in localStorage).

#### [NEW] `src/pages/admin/AdminDashboard.jsx`
Admin hub: links to manage students and manage tests.

#### [NEW] `src/pages/admin/ManageStudents.jsx`
View all registered students, add new ones (name, ID/email, password), and remove existing ones.

#### [NEW] `src/pages/admin/ManageTests.jsx`
View all created tests. Delete tests from here.

#### [NEW] `src/pages/admin/CreateTest.jsx`
Form to create a test: title, duration (minutes), and multiple-choice questions with 4 options and a correct answer selector.

#### [NEW] `src/pages/student/StudentLogin.jsx`
Student login form. Validates credentials against admin-registered student list in `localStorage`. Blocks access if not registered.

#### [NEW] `src/pages/student/StudentDashboard.jsx`
List of available tests for the logged-in student.

#### [NEW] `src/pages/student/TakeTest.jsx`
Core test interface. One question at a time, countdown timer, Next/Previous navigation, and auto-submit on timeout.

#### [NEW] `src/pages/student/TestResult.jsx`
Displays final score and a full breakdown of correct vs. student answers.

#### [NEW] `src/utils/storage.js`
Utility to read/write tests and results to `localStorage`.

## Verification Plan

### Manual Verification
- Run dev server.
- **Admin Flow:** Log in as admin → Add a student → Create a test with 2 questions and a 1-minute timer.
- **Student Flow:** Log in as the registered student → Take the test → Verify timer countdown and score calculation → Wait for auto-submit on timeout.
- **Security:** Try accessing the student dashboard without logging in — verify redirect to login page.
