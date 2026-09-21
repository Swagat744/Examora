import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ExamoraContext = createContext(undefined)

// This context now holds ONLY theme preference — the simple, single-
// component-of-state case Context was established for in Practical 3.
// The current user used to be mocked here; it's now real data living in
// Redux's authSlice (see redux/slices/authSlice.js), since an
// authenticated user involves async loading/error state and is read by
// many independent parts of the tree (Navbar, ProtectedRoute, Profile,
// Sidebar) — exactly this project's own stated criteria for Redux over
// Context. Keeping the mock user here too would create two conflicting
// sources of truth for "who is logged in".
export function ExamoraProvider({ children }) {
  const [theme, setTheme] = useState('light')

  // Keep the <html> element's class in sync with theme state so the CSS
  // variable overrides in index.css (.dark { ... }) take effect app-wide.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const value = useMemo(() => ({ theme, toggleTheme }), [theme])

  return <ExamoraContext.Provider value={value}>{children}</ExamoraContext.Provider>
}

// Custom hook wrapper around useContext — keeps consuming components from
// importing ExamoraContext directly and gives a clear error if the
// provider is missing (e.g. a page rendered outside App).
export function useExamora() {
  const ctx = useContext(ExamoraContext)
  if (ctx === undefined) {
    throw new Error('useExamora must be used within an ExamoraProvider')
  }
  return ctx
}
