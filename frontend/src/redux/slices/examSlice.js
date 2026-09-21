import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getExams, createExam, updateExam, deleteExam } from '../../services/examService'

export const fetchExams = createAsyncThunk('exam/fetchExams', async () => {
  return getExams()
})

export const createExamThunk = createAsyncThunk('exam/createExam', async (payload) => {
  return createExam(payload)
})

export const updateExamThunk = createAsyncThunk('exam/updateExam', async ({ id, payload }) => {
  return updateExam(id, payload)
})

export const deleteExamThunk = createAsyncThunk('exam/deleteExam', async (id) => {
  await deleteExam(id)
  return id
})

const initialState = {
  exams: [],
  examsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  examsError: null,

  selectedExam: null,
  examStatus: 'idle', // 'idle' | 'in-progress' | 'submitted'
}

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    selectExam: (state, action) => {
      state.selectedExam = action.payload
      state.examStatus = 'idle'
    },
    clearExam: (state) => {
      state.selectedExam = null
      state.examStatus = 'idle'
    },
    setExamStatus: (state, action) => {
      state.examStatus = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.examsStatus = 'loading'
        state.examsError = null
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.examsStatus = 'succeeded'
        state.exams = action.payload
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.examsStatus = 'failed'
        state.examsError = action.error.message
      })
      .addCase(createExamThunk.fulfilled, (state) => {
        state.examsStatus = 'idle' // Triggers refetch on next view
      })
      .addCase(updateExamThunk.fulfilled, (state) => {
        state.examsStatus = 'idle'
      })
      .addCase(deleteExamThunk.fulfilled, (state, action) => {
        state.exams = state.exams.filter((e) => e.id !== action.payload && e._id !== action.payload)
        if (state.selectedExam?.id === action.payload || state.selectedExam?._id === action.payload) {
          state.selectedExam = null
        }
      })
  },
})

export const { selectExam, clearExam, setExamStatus } = examSlice.actions
export default examSlice.reducer
