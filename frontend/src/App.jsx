import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { store } from './redux/store'
import { ExamoraProvider } from './context/ExamoraContext'
import ProtectedRoute from './components/ProtectedRoute'
import { fetchCurrentUser } from './redux/slices/authSlice'
import { getToken } from './services/apiClient'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import ExamDetails from './pages/ExamDetails'
import ExamInterface from './pages/ExamInterface'
import AdminDashboard from './pages/AdminDashboard'
import AdminExams from './pages/AdminExams'
import AdminExamForm from './pages/AdminExamForm'
import AdminExamDetails from './pages/AdminExamDetails'
import AdminQuestions from './pages/AdminQuestions'
import Profile from './pages/Profile'
import Results from './pages/Results'

// Restores a session on page refresh: if a token is already saved,
// confirm it's still valid and refetch the user it belongs to (see
// authSlice.fetchCurrentUser / isRestoring). Runs once, at the app root,
// so it's not re-triggered by route changes.
function SessionRestorer() {
  const dispatch = useDispatch()

  useEffect(() => {
    if (getToken()) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch])

  return null
}

export default function App() {
  return (
    <Provider store={store}>
      <ExamoraProvider>
        <BrowserRouter>
          <SessionRestorer />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exam/:id"
              element={
                <ProtectedRoute>
                  <ExamDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exam/:id/attempt"
              element={
                <ProtectedRoute>
                  <ExamInterface />
                </ProtectedRoute>
              }
            />

            {/* Admin & Teacher Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AdminExams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AdminExamForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AdminExamDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AdminExamForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/:id/questions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AdminQuestions />
                </ProtectedRoute>
              }
            />

            {/* Teacher Aliases */}
            <Route path="/teacher" element={<Navigate to="/admin" replace />} />
            <Route path="/teacher/*" element={<Navigate to="/admin" replace />} />

            {/* Shared Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ExamoraProvider>
    </Provider>
  )
}
