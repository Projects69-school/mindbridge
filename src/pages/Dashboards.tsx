import { Link } from 'react-router-dom'
import {
  Activity, BookHeart, CalendarDays, ChevronRight, ClipboardList, Clock3, Compass, Flower2, HandHeart,
  HeartHandshake, Mail, MessageCircle, Sparkles, Users,
} from 'lucide-react'
import { Badge, Empty } from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { appointmentsFor, appointmentStatus, bangkokDate, conversationsFor, forStudent, forTeacher, formatDate, offsetDate, requestsFor, requestStatus } from '../utils/demo'
import '../styles/dashboards.css'

const quickMoods = [
  { label: 'มีความสุข', color: '#fff0cb', icon: 'happy' }, { label: 'สบายใจ', color: '#def2e7', icon: 'calm' }, { label: 'เฉย ๆ', color: '#e9e5f6', icon: 'neutral' },
  { label: 'เหนื่อย', color: '#e1ecfa', icon: 'tired' }, { label: 'กังวล', color: '#f5e1ec', icon: 'worried' },
]
function MoodFace({ icon }: { icon: string }) {
  const mouth: Record<string, string> = { happy: 'M9 15q3 5 6 0', calm: 'M9 15q3 3 6 0', neutral: 'M9 16h6', tired: 'M10 16q2-2 4 0', worried: 'M9 17q3-4 6 0' }
  return <svg viewBox="0 0 24 24" width="33" height="33" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.45" /><path d={icon === 'calm' || icon === 'tired' ? 'M7 10q1.4-1.2 2.8 0m4.5 0q1.4-1.2 2.8 0' : 'M8.8 10.2h.1m6.2 0h.1'} stroke="currentColor" strokeWidth={icon === 'calm' || icon === 'tired' ? 1.3 : 1.9} strokeLinecap="round" /><path d={mouth[icon]} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" /></svg>
}
function BloomArt() {
  return <svg className="dashboard-art" viewBox="0 0 360 230" aria-hidden="true">
    <path d="M58 207C51 140 80 49 155 27c87-26 167 22 169 99 2 35-16 61-40 87" fill="#e5d7f8" />
    <circle cx="202" cy="112" r="77" fill="#f2e9ff" />
    <path d="M2 210c53 1 75-28 131-25s97 23 150 6c30-9 49-16 77-14v53H2Z" fill="#d6c2f2" />
    <path d="M50 229c28-35 68-69 124-70 61-2 102 35 131 71" fill="none" stroke="#a58ad2" strokeWidth="19" />
    <path d="M50 218c28-35 68-69 124-70 61-2 102 35 131 71" fill="none" stroke="#d2b9f2" strokeWidth="10" />
    <path d="M174 146V91m0 43c-9-18-23-23-40-20 5 13 15 20 40 20m1-7c10-16 22-19 37-18-5 13-14 18-37 18" fill="#af98d9" stroke="#8b6abd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M174 101c-24-13-47-32-39-51 7-16 30-15 39 0 10-15 32-16 39 0 8 19-15 38-39 51Z" fill="#b489d4" />
    <path d="M174 93c-21-12-41-28-34-44 6-13 26-12 34 1 9-13 28-14 34-1 7 16-13 32-34 44Z" fill="#ebbadb" />
    <path d="M78 102h12m-6-6v12m177-54h16m-8-8v16m16 82h11m-5.5-5.5v11m-163-98h8m-4-4v8" stroke="#9d80cc" strokeWidth="2" strokeLinecap="round" />
    <circle cx="107" cy="129" r="3" fill="#fdf6ff" /><circle cx="248" cy="112" r="4" fill="#fff8ff" /><circle cx="294" cy="103" r="3" fill="#ad91d7" />
    <path d="M64 71c4-8 10-8 14 0 4-8 10-8 14 0-4 6-14 12-14 12s-10-6-14-12Z" fill="#f1cee6" />
    <path d="M278 84c6-10 14-10 20 0 5-10 13-10 19 0-5 8-19 16-19 16s-14-8-20-16Z" fill="#f1cee6" />
  </svg>
}
const studentShortcuts = [
  { icon: Compass, title: 'วงล้ออารมณ์', secondary: 'หาคำที่ตรงกับใจ', route: 'emotion-decoder', tone: 'lavender' },
  { icon: BookHeart, title: 'บันทึกส่วนตัว', secondary: 'เขียนเมื่ออยากระบาย', route: 'journal', tone: 'pink' },
  { icon: HeartHandshake, title: 'Trust Ladder', secondary: 'เปิดใจตามความพร้อม', route: 'trust-ladder', tone: 'mint' },
  { icon: Sparkles, title: 'กิจกรรมดูแลใจ', secondary: 'ให้เวลาพักกับตัวเอง', route: 'wellness', tone: 'blue' },
]

export function StudentDashboard() {
  const { state } = useDemo()
  const student = forStudent(state)
  const latest = state.checkIns.filter(row => row.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  const today = latest.find(row => row.date === bangkokDate())
  const request = requestsFor(state, 'student')[0]
  const appointment = appointmentsFor(state, 'student').filter(row => row.status === 'confirmed' && row.date >= bangkokDate()).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0]
  const follow = state.followUps.filter(row => row.studentId === student.id && !row.completed && row.date >= bangkokDate()).sort((a, b) => a.date.localeCompare(b.date))[0]
  const conversations = conversationsFor(state, 'student').filter(row => !row.archivedBy.includes('student'))
  const latestMessage = state.messages.filter(row => row.sender === 'teacher' && conversations.some(conversation => conversation.id === row.conversationId)).at(-1)
  return <div className="dash-content">
    <section className="student-hero">
      <div><span className="hero-label"><Flower2 size={15} /> พื้นที่พักใจของเธอ</span><h1>สวัสดี {student.name} {student.avatar}</h1><p>วันนี้เป็นอย่างไรบ้าง? พื้นที่นี้เป็นของเธอ</p><div className="button-row"><Link to="/student/support" className="btn btn-primary"><HeartHandshake size={18} /> ขอความช่วยเหลือ</Link><Link to="/student/trust-ladder" className="btn btn-secondary">เปิดใจตามความพร้อม</Link></div></div>
      <BloomArt />
    </section>
    <div className="dash-bento">
      <section className="panel mood-panel">
        <div className="dash-card-head"><span className="icon-tile tone-lavender"><Flower2 size={23} /></span><div><h2>วันนี้เธอรู้สึกอย่างไร?</h2><p>ลองเลือกคำที่ใกล้กับความรู้สึกของตัวเอง</p></div></div>
        <div className="dash-moods">{quickMoods.map(({ label, color, icon }) => <Link key={label} to={`/student/emotions?emotion=${encodeURIComponent(label)}`} aria-label={`เช็กอินอารมณ์ ${label}`}><span style={{ background: color }}><MoodFace icon={icon} /></span><small>{label}</small></Link>)}</div>
        <div className="dash-card-bottom"><small>{today ? `วันนี้บันทึกแล้ว · ${today.emotions.join(' · ')}` : latest[0] ? `ครั้งล่าสุด · ${latest[0].emotions.join(' · ')}` : 'บันทึกอารมณ์เป็นส่วนตัว'}</small><Link to="/student/emotions" className="text-link">เช็กอินอารมณ์ <ChevronRight size={16} /></Link></div>
      </section>
      <section className="panel student-journey">
        <div className="dash-card-head"><span className="icon-tile tone-mint"><HandHeart size={23} /></span><div><h2>เส้นทางการดูแล</h2><p>เรื่องที่เธอเลือกให้ครูช่วย</p></div></div>
        {request ? <div className="dash-journey-status"><Badge tone={request.status === 'new' ? 'yellow' : 'mint'}>{requestStatus[request.status]}</Badge><strong>{request.preference}</strong><small>{state.teachers.find(row => row.id === request.teacherId)?.name} · {formatDate(request.createdAt)}</small></div>
          : <p className="muted dash-journey-status">เมื่อส่งคำขอให้ครูแล้ว ดูความคืบหน้าได้ที่นี่</p>}
        <Link to={request ? `/student/journey?id=${request.id}` : '/student/journey'} className="text-link">ดูเส้นทางของฉัน <ChevronRight size={16} /></Link>
      </section>
    </div>
    <nav className="dash-shortcuts" aria-label="ทางลัดดูแลใจ">{studentShortcuts.map(({ icon: Icon, title, secondary, route, tone }) => <Link className="panel dash-shortcut" to={`/student/${route}`} key={route}>
      <span className={`icon-tile tone-${tone}`}><Icon size={22} /></span><span><strong>{title}</strong><small>{secondary}</small></span><ChevronRight size={16} />
    </Link>)}</nav>
    <div className="dash-bento dash-bento-bottom">
      <section className="panel">
        <div className="dash-card-head spaced"><div><h2>อารมณ์ในสัปดาห์นี้</h2><p>บันทึกความรู้สึกย้อนหลัง 7 วัน</p></div><Link to="/student/mood-timeline" className="text-link">ดูย้อนหลัง <ChevronRight size={16} /></Link></div>
        <div className="dash-mini-chart">{Array.from({ length: 7 }, (_, i) => {
          const date = offsetDate(i - 6)
          const row = latest.find(item => item.date === date)
          return <Link key={date} to={`/student/mood-timeline?date=${date}`} aria-label={`${formatDate(date)} ${row?.emotions.join(' ') ?? 'ยังไม่มีบันทึก'}`} title={row?.emotions.join(' · ') ?? 'ยังไม่มีบันทึก'}>
            <span style={{ height: `${row ? 19 + row.intensity * 14 : 7}px` }} className={row ? 'filled' : ''} /><small>{formatDate(date, { weekday: 'short' })}</small>
          </Link>
        })}</div>
      </section>
      <section className="panel dash-agenda">
        <h2>นัดหมายและข้อความ</h2>
        {appointment ? <Link className="dash-list-row" to="/student/appointments"><span className="icon-tile tone-blue"><CalendarDays size={18} /></span><span><strong>{appointment.type}</strong><small>{formatDate(appointment.date)} · {appointment.time} น.</small></span><ChevronRight size={15} /></Link> : <p className="muted">ยังไม่มีนัดที่ยืนยันแล้ว</p>}
        {follow && <Link className="dash-list-row" to={`/student/journey?id=${follow.requestId}`}><span className="icon-tile tone-mint"><Clock3 size={18} /></span><span><strong>{follow.title}</strong><small>ติดตามผล · {formatDate(follow.date)}</small></span><ChevronRight size={15} /></Link>}
        {latestMessage && <Link className="dash-list-row" to={`/student/messages?id=${latestMessage.conversationId}`}><span className="icon-tile tone-pink"><MessageCircle size={18} /></span><span><strong>ข้อความล่าสุดจากครู</strong><small>{latestMessage.text || 'มีไฟล์แนบในบทสนทนา'}</small></span><ChevronRight size={15} /></Link>}
      </section>
    </div>
  </div>
}

export function TeacherDashboard() {
  const { state } = useDemo()
  const teacher = forTeacher(state)
  const requests = requestsFor(state, 'teacher')
  const conversations = conversationsFor(state, 'teacher')
  const unread = state.messages.filter(row => row.sender === 'student' && !row.read && conversations.some(conversation => conversation.id === row.conversationId && !conversation.archivedBy.includes('teacher')))
  const unanswered = conversations.filter(conversation => {
    if (conversation.archivedBy.includes('teacher')) return false
    return state.messages.filter(message => message.conversationId === conversation.id).at(-1)?.sender === 'student'
  })
  const appointments = appointmentsFor(state, 'teacher')
  const todayAppointments = appointments.filter(row => row.date === bangkokDate() && ['pending', 'confirmed', 'proposed'].includes(row.status))
  const follows = state.followUps.filter(row => row.teacherId === teacher.id && !row.completed).sort((a, b) => a.date.localeCompare(b.date))
  const assignedCount = new Set(state.assignments.filter(row => row.teacherId === teacher.id).map(row => row.studentId)).size
  const stats = [
    { title: 'นักเรียนในความดูแล', value: assignedCount, icon: Users, tone: 'lavender', href: 'students' },
    { title: 'คำขอใหม่', value: requests.filter(item => item.status === 'new').length, icon: HandHeart, tone: 'pink', href: 'requests' },
    { title: 'ข้อความที่ยังไม่ได้ตอบ', value: unanswered.length, icon: Mail, tone: 'blue', href: 'messages' },
    { title: 'นัดหมายวันนี้', value: todayAppointments.length, icon: CalendarDays, tone: 'yellow', href: 'appointments' },
    { title: 'รายการติดตามผล', value: follows.length, icon: Clock3, tone: 'mint', href: 'follow-ups' },
    { title: 'กำลังดูแล', value: requests.filter(item => !['new','closed'].includes(item.status)).length, icon: Activity, tone: 'lavender', href: 'care' },
  ]
  return <div className="dash-content teacher-dash">
    <section className="teacher-hero">
      <div><div className="eyebrow">พื้นที่ดูแลนักเรียน · {formatDate(bangkokDate(), { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>ยินดีต้อนรับ {teacher.name}</h1><p>ทุกการดูแลที่มีความหมาย เริ่มต้นจากการรับฟัง</p></div>
      <Link to="/teacher/requests" className="btn btn-primary"><ClipboardList size={18} /> ดูคำขอความช่วยเหลือ</Link>
    </section>
    <div className="teacher-stats">{stats.map(({ title, value, icon: Icon, tone, href }) => <Link to={`/teacher/${href}`} className="panel teacher-stat" key={title}>
      <span className={`icon-tile tone-${tone}`}><Icon size={21} /></span><span><strong>{value}</strong><small>{title}</small></span><ChevronRight size={17} />
    </Link>)}</div>
    <div className="dash-bento teacher-bento">
      <section className="panel">
        <div className="dash-card-head spaced"><div><h2>คำขอความช่วยเหลือล่าสุด</h2><p>ข้อมูลที่นักเรียนเลือกแบ่งปัน</p></div><Link to="/teacher/requests" className="text-link">ดูทั้งหมด <ChevronRight size={16} /></Link></div>
        {requests.length ? requests.slice(0, 4).map(request => {
          const student = state.students.find(row => row.id === request.studentId)
          return <Link className="dash-list-row teacher-request-row" to={`/teacher/requests?id=${request.id}`} key={request.id}>
            <span className="profile-avatar">{student?.avatar}</span><span><strong>{student?.name} · {request.preference}</strong><small>{student?.classroom} · {formatDate(request.createdAt)}</small></span><Badge tone={request.status === 'new' ? 'yellow' : 'mint'}>{requestStatus[request.status]}</Badge><ChevronRight size={15} />
          </Link>
        }) : <Empty title="ยังไม่มีคำขอความช่วยเหลือ" description="คำขอใหม่จะแสดงในหน้านี้" />}
      </section>
      <section className="panel dash-agenda">
        <div className="dash-card-head spaced"><div><h2>กำหนดการดูแล</h2><p>นัดหมายวันนี้และติดตามผล</p></div></div>
        {!todayAppointments.length && !follows.length && <Empty title="ยังไม่มีกำหนดการ" icon={CalendarDays} />}
        {todayAppointments.map(row => <Link className="dash-list-row" to={`/teacher/appointments?id=${row.id}`} key={row.id}><span className="icon-tile tone-blue"><CalendarDays size={18} /></span><span><strong>{row.type} · {state.students.find(item => item.id === row.studentId)?.name}</strong><small>{row.time} น. · {appointmentStatus[row.status]}</small></span><ChevronRight size={16} /></Link>)}
        {follows.slice(0, 3).map(row => <Link className="dash-list-row" to={`/teacher/care?request=${row.requestId}&panel=followup`} key={row.id}><span className="icon-tile tone-mint"><Clock3 size={18} /></span><span><strong>{row.title}</strong><small>{formatDate(row.date)}</small></span><ChevronRight size={16} /></Link>)}
      </section>
    </div>
    <div className="dash-bento">
      <section className="panel">
        <div className="dash-card-head spaced"><div><h2>คำขอในรอบ 7 วัน</h2><p>ข้อมูลสมมติสำหรับการสาธิต</p></div><Link to="/teacher/reports" className="text-link">ดูรายงาน <ChevronRight size={16} /></Link></div>
        <div className="dash-mini-chart">{Array.from({ length: 7 }, (_, index) => {
          const date = offsetDate(index - 6)
          const count = requests.filter(request => bangkokDate(new Date(request.createdAt)) === date).length
          return <Link to="/teacher/reports" key={date} title={`${formatDate(date)} · ${count} คำขอ`} aria-label={`${formatDate(date)} ${count} คำขอ`}><span className={count ? 'filled' : ''} style={{ height: `${count ? Math.min(100, 20 + count * 22) : 7}px` }} /><small>{formatDate(date, { weekday:'short' })}</small></Link>
        })}</div>
      </section>
      <section className="panel dash-agenda">
        <h2>กล่องข้อความ</h2>
        {unread.length ? unread.slice(-3).reverse().map(message => {
          const conversation = conversations.find(row => row.id === message.conversationId)
          const name = state.students.find(row => row.id === conversation?.studentId)?.name
          return <Link key={message.id} className="dash-list-row" to={`/teacher/messages?id=${message.conversationId}`}><span className="icon-tile tone-pink"><MessageCircle size={18} /></span><span><strong>ข้อความใหม่จาก{name}</strong><small>{message.text}</small></span><ChevronRight size={16} /></Link>
        }) : <p className="muted">อ่านครบทุกข้อความแล้ว</p>}
        <Link to="/teacher/guidance" className="text-link">เปิดคู่มือการรับฟัง <ChevronRight size={16} /></Link>
      </section>
    </div>
  </div>
}
