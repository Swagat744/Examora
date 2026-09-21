import { LayoutDashboard, ListChecks, BarChart3, User, FileText, Users } from 'lucide-react'

// Every entry here is a real route, not a decorative label — Sidebar
// navigates to `to` directly. Logout intentionally has no entry: it
// lives only inside the Profile page (see pages/Profile.jsx).
export const studentSidebarLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/student' },
  { label: 'Exams', icon: ListChecks, to: '/student' },
  { label: 'Results', icon: BarChart3, to: '/student/results' },
  { label: 'Profile', icon: User, to: '/profile' },
]

export const adminSidebarLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Exams', icon: FileText, to: '/admin/exams' },
  { label: 'Profile', icon: User, to: '/profile' },
]
