// Mock data for Examora — Experiment 1 (frontend UI only).
// In a future experiment this file's shape becomes the contract for a
// services/ layer that fetches the same data from a REST API.

export const features = [
  {
    id: 1,
    title: 'Online Examinations',
    description: 'Create and publish exams your students can take from any device, anywhere.',
    icon: 'monitor',
  },
  {
    id: 2,
    title: 'Secure Timed Tests',
    description: 'Every attempt runs against a countdown clock that locks the exam the moment time is up.',
    icon: 'shield',
  },
  {
    id: 3,
    title: 'Automatic Evaluation',
    description: 'Objective questions are scored the instant a student submits — no manual grading queue.',
    icon: 'check',
  },
  {
    id: 4,
    title: 'Performance Tracking',
    description: 'Students see score trends over time; teachers see the same trend across a whole class.',
    icon: 'chart',
  },
  {
    id: 5,
    title: 'Exam Management',
    description: 'Schedule, edit, and publish exams from a single control panel built for teaching staff.',
    icon: 'calendar',
  },
  {
    id: 6,
    title: 'Question Bank',
    description: 'Build a reusable library of questions, tagged by subject and difficulty.',
    icon: 'layers',
  },
]

export const howItWorks = [
  { id: 1, title: 'Create Exam', description: 'A teacher builds an exam from the question bank and sets a duration.' },
  { id: 2, title: 'Take Exam', description: 'Students attempt the exam within the scheduled window, against the clock.' },
  { id: 3, title: 'Automatic Evaluation', description: 'Objective answers are scored the moment the exam is submitted.' },
  { id: 4, title: 'View Results', description: 'Scores and performance breakdowns are ready immediately after.' },
]

export const studentStats = [
  { id: 1, label: 'Available Exams', value: 4, tone: 'teal' },
  { id: 2, label: 'Upcoming Exams', value: 2, tone: 'amber' },
  { id: 3, label: 'Completed Exams', value: 12, tone: 'success' },
]

export const exams = [
  {
    id: 1,
    title: 'DBMS Internal Examination',
    subject: 'Database Management Systems',
    date: '21 Aug 2026',
    time: '10:00 AM',
    duration: 30,
    questions: 20,
    marks: 20,
    status: 'Upcoming',
  },
  {
    id: 2,
    title: 'Java Programming Assessment',
    subject: 'Object-Oriented Programming',
    date: '24 Aug 2026',
    time: '2:00 PM',
    duration: 45,
    questions: 25,
    marks: 25,
    status: 'Available',
  },
  {
    id: 3,
    title: 'Computer Networks Quiz',
    subject: 'Computer Networks',
    date: '27 Aug 2026',
    time: '11:30 AM',
    duration: 20,
    questions: 15,
    marks: 15,
    status: 'Available',
  },
  {
    id: 4,
    title: 'Operating Systems Mid-Term',
    subject: 'Operating Systems',
    date: '15 Aug 2026',
    time: '9:00 AM',
    duration: 40,
    questions: 20,
    marks: 20,
    status: 'Completed',
  },
  {
    id: 5,
    title: 'Cloud Computing Fundamentals',
    subject: 'Cloud Computing',
    date: '10 Aug 2026',
    time: '1:00 PM',
    duration: 30,
    questions: 20,
    marks: 20,
    status: 'Completed',
  },
]

export const recentResults = [
  { id: 1, exam: 'Operating Systems Mid-Term', score: 17, total: 20, percentage: 85, date: '15 Aug 2026', status: 'Pass' },
  { id: 2, exam: 'Cloud Computing Fundamentals', score: 14, total: 20, percentage: 70, date: '10 Aug 2026', status: 'Pass' },
  { id: 3, exam: 'Data Structures Quiz', score: 9, total: 20, percentage: 45, date: '2 Aug 2026', status: 'Fail' },
]

export const examQuestions = [
  {
    id: 1,
    text: 'Which normal form removes partial dependency on a candidate key?',
    options: ['First Normal Form', 'Second Normal Form', 'Third Normal Form', 'BCNF'],
  },
  {
    id: 2,
    text: 'Which SQL clause is used to filter groups after aggregation?',
    options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
  },
  {
    id: 3,
    text: 'A foreign key in a relational table must reference a:',
    options: ['Composite index', 'Primary key of another table', 'Non-null column', 'View'],
  },
  {
    id: 4,
    text: 'Which of these is NOT a property of a database transaction (ACID)?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Scalability'],
  },
  {
    id: 5,
    text: 'A deadlock in a DBMS occurs when:',
    options: [
      'A query returns no rows',
      'Two transactions wait indefinitely for each other\u2019s locks',
      'An index is corrupted',
      'A table has no primary key',
    ],
  },
]

export const adminStats = [
  { id: 1, label: 'Students', value: 248 },
  { id: 2, label: 'Exams', value: 24 },
  { id: 3, label: 'Attempts', value: 1284 },
  { id: 4, label: 'Active Exams', value: 18 },
]

export const activeExams = [
  { id: 1, title: 'DBMS Mid-Term', status: 'Active', attempts: 142 },
  { id: 2, title: 'Java Programming', status: 'Scheduled', attempts: 0 },
  { id: 3, title: 'Cloud Computing', status: 'Completed', attempts: 231 },
  { id: 4, title: 'Computer Networks', status: 'Active', attempts: 87 },
]

export const recentActivity = [
  { id: 1, text: 'Priya Sharma submitted DBMS Mid-Term', time: '2 min ago' },
  { id: 2, text: 'New student registered — Rahul Verma', time: '18 min ago' },
  { id: 3, text: 'Java Programming exam published', time: '1 hr ago' },
  { id: 4, text: 'Question added to Networks question bank', time: '3 hr ago' },
]
