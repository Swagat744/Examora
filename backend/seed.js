// Populates MongoDB with sample Exams, Questions, and two demo accounts.
// Run with: npm run seed  (wipes Exams/Questions/Users and re-inserts)
//
// numberOfQuestions/totalMarks on each exam are kept in sync with the
// questions actually inserted below — the database is the single source
// of truth the frontend now reads from, so a mismatch here would show up
// as a real bug ("Question 1 of 20" with only 5 real questions).

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { Exam } from './models/Exam.js'
import { Question } from './models/Question.js'
import { User } from './models/User.js'

dotenv.config()

const examDefs = [
  {
    exam: {
      title: 'DBMS Internal Examination',
      subject: 'Database Management Systems',
      description: 'Internal assessment covering normalization, SQL, and transactions.',
      instructions: 'Read each question carefully. Once submitted, answers cannot be changed.',
      duration: 30,
      startTime: new Date('2026-08-21T10:00:00'),
      endTime: new Date('2026-08-21T10:30:00'),
      status: 'scheduled',
    },
    questions: [
      { questionText: 'Which normal form removes partial dependency on a candidate key?', options: ['First Normal Form', 'Second Normal Form', 'Third Normal Form', 'BCNF'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which SQL clause is used to filter groups after aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correctAnswer: 1, marks: 1 },
      { questionText: 'A foreign key in a relational table must reference a:', options: ['Composite index', 'Primary key of another table', 'Non-null column', 'View'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which of these is NOT a property of a database transaction (ACID)?', options: ['Atomicity', 'Consistency', 'Isolation', 'Scalability'], correctAnswer: 3, marks: 1 },
      { questionText: 'A deadlock in a DBMS occurs when:', options: ['A query returns no rows', "Two transactions wait indefinitely for each other's locks", 'An index is corrupted', 'A table has no primary key'], correctAnswer: 1, marks: 1 },
    ],
  },
  {
    exam: {
      title: 'Java Programming Assessment',
      subject: 'Object-Oriented Programming',
      description: 'Assessment on core Java and OOP concepts.',
      instructions: 'Read each question carefully. Once submitted, answers cannot be changed.',
      duration: 45,
      startTime: new Date('2026-08-24T14:00:00'),
      endTime: new Date('2026-08-24T14:45:00'),
      status: 'active',
    },
    questions: [
      { questionText: 'Which keyword prevents a class from being subclassed in Java?', options: ['static', 'final', 'private', 'abstract'], correctAnswer: 1, marks: 2 },
      { questionText: 'Which OOP principle allows a subclass to provide its own implementation of a method?', options: ['Encapsulation', 'Overriding', 'Overloading', 'Abstraction'], correctAnswer: 1, marks: 2 },
      { questionText: 'What does the JVM primarily do?', options: ['Compiles Java to C++', 'Executes Java bytecode', 'Manages the database', 'Renders the UI'], correctAnswer: 1, marks: 2 },
      { questionText: "Which collection does NOT allow duplicate elements?", options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], correctAnswer: 2, marks: 2 },
      { questionText: 'Which access modifier is the most restrictive?', options: ['public', 'protected', 'default', 'private'], correctAnswer: 3, marks: 2 },
    ],
  },
  {
    exam: {
      title: 'Computer Networks Quiz',
      subject: 'Computer Networks',
      description: 'Quick quiz on networking fundamentals.',
      instructions: 'Read each question carefully. Once submitted, answers cannot be changed.',
      duration: 20,
      startTime: new Date('2026-08-27T11:30:00'),
      endTime: new Date('2026-08-27T11:50:00'),
      status: 'active',
    },
    questions: [
      { questionText: 'Which layer of the OSI model is responsible for routing?', options: ['Data Link', 'Network', 'Transport', 'Session'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which protocol resolves domain names to IP addresses?', options: ['DHCP', 'FTP', 'DNS', 'ARP'], correctAnswer: 2, marks: 1 },
      { questionText: 'TCP is described as a connection-oriented protocol because it:', options: ['Uses UDP under the hood', 'Establishes a session before data transfer', 'Never retransmits lost packets', 'Only works over LAN'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which device operates primarily at the Data Link layer?', options: ['Router', 'Switch', 'Hub', 'Modem'], correctAnswer: 1, marks: 1 },
    ],
  },
  {
    exam: {
      title: 'Operating Systems Mid-Term',
      subject: 'Operating Systems',
      description: 'Mid-term covering process scheduling and memory management.',
      instructions: 'Read each question carefully. Once submitted, answers cannot be changed.',
      duration: 40,
      startTime: new Date('2026-08-15T09:00:00'),
      endTime: new Date('2026-08-15T09:40:00'),
      status: 'completed',
    },
    questions: [
      { questionText: 'Which scheduling algorithm can cause starvation?', options: ['Round Robin', 'Priority Scheduling', 'FCFS', 'None of these'], correctAnswer: 1, marks: 2 },
      { questionText: 'A page fault occurs when:', options: ['A process terminates', 'A requested page is not in memory', 'The CPU is idle', 'Two processes deadlock'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which of these is a necessary condition for deadlock?', options: ['Preemption', 'Circular wait', 'Paging', 'Virtualization'], correctAnswer: 1, marks: 2 },
      { questionText: 'What does a context switch save and restore?', options: ['File descriptors only', 'Process state/registers', 'Only the program counter', 'Nothing, it is instant'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which memory management technique divides memory into fixed-size blocks?', options: ['Segmentation', 'Paging', 'Swapping', 'Caching'], correctAnswer: 1, marks: 2 },
    ],
  },
  {
    exam: {
      title: 'Cloud Computing Fundamentals',
      subject: 'Cloud Computing',
      description: 'Fundamentals of cloud service and deployment models.',
      instructions: 'Read each question carefully. Once submitted, answers cannot be changed.',
      duration: 30,
      startTime: new Date('2026-08-10T13:00:00'),
      endTime: new Date('2026-08-10T13:30:00'),
      status: 'completed',
    },
    questions: [
      { questionText: 'Which service model provides only the runtime/platform, not the infrastructure?', options: ['IaaS', 'PaaS', 'SaaS', 'DaaS'], correctAnswer: 1, marks: 1 },
      { questionText: 'A cloud accessible only to a single organization is called:', options: ['Public cloud', 'Private cloud', 'Community cloud', 'Hybrid cloud'], correctAnswer: 1, marks: 1 },
      { questionText: 'Which of these is a key characteristic of cloud computing?', options: ['Fixed hardware allocation', 'On-demand self-service', 'Manual provisioning only', 'No internet dependency'], correctAnswer: 1, marks: 1 },
      { questionText: 'Auto-scaling in the cloud primarily helps with:', options: ['Reducing code complexity', 'Handling variable load automatically', 'Encrypting data at rest', 'Compiling source code'], correctAnswer: 1, marks: 1 },
    ],
  },
]

const demoUsers = [
  {
    name: 'Swagat Patil',
    email: 'swagat@example.com',
    passwordHash: 'password123', // hashed by the User pre-save hook
    provider: 'local',
    role: 'student',
  },
  {
    name: 'Examora Faculty',
    email: 'faculty@example.com',
    passwordHash: 'password123',
    provider: 'local',
    role: 'teacher', // promoted directly here — signup can never do this
  },
]

async function seed() {
  await connectDB()

  console.log('Clearing existing Exams, Questions, and demo Users...')
  await Exam.deleteMany({})
  await Question.deleteMany({})
  await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } })

  console.log('Inserting exams and questions...')
  let totalQuestions = 0

  for (const def of examDefs) {
    const totalMarks = def.questions.reduce((sum, q) => sum + q.marks, 0)
    const exam = await Exam.create({
      ...def.exam,
      totalMarks,
      numberOfQuestions: def.questions.length,
    })
    await Question.insertMany(
      def.questions.map((q, i) => ({ ...q, exam: exam._id, questionOrder: i + 1 })),
    )
    totalQuestions += def.questions.length
    console.log(`  - ${exam.title}: ${def.questions.length} questions, ${totalMarks} marks`)
  }

  console.log('Creating demo accounts...')
  for (const u of demoUsers) {
    await User.create(u)
    console.log(`  - ${u.email} / password123 (${u.role})`)
  }

  console.log(`\nSeeded ${examDefs.length} exams, ${totalQuestions} questions, ${demoUsers.length} users.`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
