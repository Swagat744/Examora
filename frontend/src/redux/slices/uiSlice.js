import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeDashboardTab: 'All',
  searchQuery: '',
  sidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDashboardTab: (state, action) => {
      state.activeDashboardTab = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
  },
})

export const { setDashboardTab, setSearchQuery, toggleSidebar, setSidebarOpen } = uiSlice.actions
export default uiSlice.reducer
