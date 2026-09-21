import mongoose from 'mongoose'

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    // { [questionId]: selectedOptionIndex } — only what the student
    // picked. The correct answer is never taken from the frontend.
    answers: {
      type: Map,
      of: Number,
      default: {},
    },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    incorrectCount: { type: Number, required: true },
    unansweredCount: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['submitted'],
      default: 'submitted',
    },
  },
  { timestamps: true },
)

// One student can only have one stored attempt per exam — resubmission
// is rejected at the database level, not just in the controller, so this
// holds even under a race (e.g. a double-click that fires two requests).
attemptSchema.index({ student: 1, exam: 1 }, { unique: true })

export const Attempt = mongoose.model('Attempt', attemptSchema)
