import mongoose from 'mongoose'

const EXAM_STATUSES = ['draft', 'scheduled', 'active', 'completed', 'archived']

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: Number, // minutes
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be a positive number'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [0, 'Total marks cannot be negative'],
    },
    numberOfQuestions: {
      type: Number,
      required: [true, 'Number of questions is required'],
      min: [0, 'Number of questions cannot be negative'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || !this.startTime || value > this.startTime
        },
        message: 'endTime must be after startTime',
      },
    },
    status: {
      type: String,
      enum: {
        values: EXAM_STATUSES,
        message: `status must be one of: ${EXAM_STATUSES.join(', ')}`,
      },
      default: 'draft',
    },
  },
  { timestamps: true },
)

export const Exam = mongoose.model('Exam', examSchema)
export { EXAM_STATUSES }
