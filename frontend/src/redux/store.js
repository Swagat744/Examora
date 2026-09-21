import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import examReducer from './slices/examSlice'
import questionReducer from './slices/questionSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    exam: examReducer,
    questions: questionReducer,
    ui: uiReducer,
  },
})
