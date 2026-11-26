import type { AppointmentStatus, DemoState, RequestStatus, Role } from '../types/demo'

export const STUDENT_ID = 'student-fah'
export const TEACHER_ID = 'teacher-ploy'
export const now = () => new Date().toISOString()
export const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
export const bangkokDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
export const offsetDate = (days: number) => bangkokDate(new Date(Date.now() + days * 86400000))
export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00+07:00` : value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', ...options }).format(date)
}
export const formatTime = (value: string) => formatDate(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export const weekday = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay()
export const activeAppointment = (status: AppointmentStatus) => ['pending', 'confirmed', 'proposed'].includes(status)
export const requestStatus: Record<RequestStatus, string> = { new: 'ส่งคำขอแล้ว', accepted: 'ครูรับเรื่องแล้ว', talking: 'กำลังพูดคุย', planned: 'อยู่ระหว่างการดูแล', followup: 'นัดติดตามผล', referred: 'ส่งต่อผู้เชี่ยวชาญ', closed: 'สิ้นสุดการดูแล' }
export const appointmentStatus: Record<AppointmentStatus, string> = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', proposed: 'เสนอเวลาใหม่', declined: 'ปฏิเสธ', cancelled: 'ยกเลิกแล้ว', completed: 'เสร็จสิ้น' }
export const demoNotice = 'โหมดสาธิต — ใช้ข้อมูลสมมติเท่านั้น กรุณาไม่กรอกข้อมูลส่วนตัวหรือข้อมูลสุขภาพจริง'
export const forStudent = (state: DemoState) => state.students.find(student => student.id === STUDENT_ID)!
export const forTeacher = (state: DemoState) => state.teachers.find(teacher => teacher.id === state.teacherId)!
export const requestsFor = (state: DemoState, role: Role) => state.requests.filter(request => role === 'student' ? request.studentId === STUDENT_ID : request.teacherId === state.teacherId)
export const conversationsFor = (state: DemoState, role: Role) => state.conversations.filter(conversation => role === 'student' ? conversation.studentId === STUDENT_ID : conversation.teacherId === state.teacherId)
export const appointmentsFor = (state: DemoState, role: Role) => state.appointments.filter(appointment => role === 'student' ? appointment.studentId === STUDENT_ID : appointment.teacherId === state.teacherId)
export const notificationsFor = (state: DemoState, role: Role) => state.notifications.filter(notification => notification.role === role && notification.recipientId === (role === 'student' ? STUDENT_ID : state.teacherId))
export const sharedFor = (state: DemoState, teacherId: string, studentId?: string) => state.sharedItems.filter(item => item.teacherId === teacherId && !item.revoked && (!studentId || item.studentId === studentId))
