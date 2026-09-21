import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'A question must reference an exam'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: 'A question needs at least 2 options',
      },
      required: [true, 'Options are required'],
    },
    correctAnswer: {
      type: Number, // index into options[]
      required: [true, 'correctAnswer index is required'],
      validate: {
        validator: function (value) {
          return value >= 0 && value < this.options.length
        },
        message: 'correctAnswer must be a valid index into options',
      },
    },
    marks: {
      type: Number,
      required: [true, 'Marks is required'],
      min: [0, 'Marks cannot be negative'],
      default: 1,
    },
    questionOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// Student-facing responses should never leak the correct answer. Any
// route that serves questions to students should use this projection
// (see questionController.getQuestionsForExam).
questionSchema.methods.toPublicJSON = function () {
  const { _id, exam, questionText, options, marks, questionOrder } = this
  return { _id, exam, questionText, options, marks, questionOrder }
}

export const Question = mongoose.model('Question', questionSchema)
