import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    mobileNavOpen: false,
    theme: 'light' as 'light' | 'dark',
  },
  reducers: {
    setMobileNavOpen(state, action) { state.mobileNavOpen = action.payload; },
    toggleTheme(state) { state.theme = state.theme === 'light' ? 'dark' : 'light'; },
  },
});

export const { setMobileNavOpen, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
