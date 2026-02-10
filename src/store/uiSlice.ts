import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    mobileNavOpen: false,
    theme: 'light' as 'light' | 'dark',
  },
  reducers: {
    toggleSidebar(state) { state.sidebarCollapsed = !state.sidebarCollapsed },
    setSidebarCollapsed(state, action) { state.sidebarCollapsed = action.payload },
    toggleMobileNav(state) { state.mobileNavOpen = !state.mobileNavOpen },
    setMobileNavOpen(state, action) { state.mobileNavOpen = action.payload },
    toggleTheme(state) { state.theme = state.theme === 'light' ? 'dark' : 'light' },
    setTheme(state, action) { state.theme = action.payload },
  },
})

export const { toggleSidebar, setSidebarCollapsed, toggleMobileNav, setMobileNavOpen, toggleTheme, setTheme } = uiSlice.actions
export default uiSlice.reducer
