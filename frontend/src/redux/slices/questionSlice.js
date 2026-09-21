import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: {}, // { [questionIndex]: selectedOptionIndex }
}

const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    loadQuestions: (state, action) => {
      state.questions = action.payload
      state.currentQuestionIndex = 0
      state.answers = {}
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1
      }
    },
    goToQuestion: (state, action) => {
      const index = action.payload
      if (index >= 0 && index < state.questions.length) {
        state.currentQuestionIndex = index
      }
    },
    selectAnswer: (state, action) => {
      const { questionIndex, optionIndex } = action.payload
      state.answers[questionIndex] = optionIndex
    },
    resetExam: (state) => {
      state.currentQuestionIndex = 0
      state.answers = {}
    },
  },
})

export const {
  loadQuestions,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  selectAnswer,
  resetExam,
} = questionSlice.actions

export default questionSlice.reducer
