import { useState } from 'react'
import { ArrowLeft, CalendarDays, ClipboardList, HeartHandshake, Image, LockKeyhole, MessageCircle, Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { RequestStatus, Student, SupportRequest } from '../../types/demo'
import { appointmentStatus, requestsFor, requestStatus, sharedFor } from '../../utils/demo'
import { dateLabel, ToolEmpty, ToolHeading, ToolNotice, ToolSection, ToolStatus } from './ToolUI'

const sharedNames = { emotion: 'อารมณ์ที่แชร์', journal: 'บางส่วนจากบันทึก', drawing: 'ภาพวาดที่แชร์', voice: 'เสียงที่แชร์', image: 'ภาพที่แชร์' }

function getLatest(requests: SupportRequest[], studentId: string) {
  return requests.filter((row) => row.studentId === studentId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]
}

function StudentProfile({ student }: { student: Student }) {
  const { state } = useDemo()
  const teacherId = state.teacherId
  const requests = requestsFor(state, 'teacher').filter((row) => row.studentId === student.id)
  const shared = sharedFor(state, teacherId, student.id).filter((item) => item.owner !== 'teacher')
  const appointments = state.appointments.filter((row) => row.teacherId === teacherId && row.studentId === student.id)
  const conversations = state.conversations.filter((row) => row.teacherId === teacherId && row.studentId === student.id)
  const plans = state.plans.filter((row) => row.teacherId === teacherId && row.studentId === student.id)
  const notes = state.notes.filter((row) => row.teacherId === teacherId && row.studentId === student.id)
  const followUps = state.followUps.filter((row) => row.teacherId === teacherId && row.studentId === student.id)
  const referrals = state.referrals.filter((row) => row.teacherId === teacherId && row.studentId === student.id)

  return <>
    <ToolHeading icon={UserRound} label="ข้อมูลการดูแลนักเรียน" title={student.name} description={`${student.grade} · ${student.classroom}`} action={<Link className="mt-button" to="/teacher/students"><ArrowLeft size={17} aria-hidden="true" /> นักเรียนในความดูแล</Link>} />
    <ToolNotice icon={LockKeyhole}>หน้านี้จะแสดงเฉพาะข้อมูลตามสิทธิ์จำลองของคุณครูและสิ่งที่นักเรียนเลือกแชร์ให้คุณครู</ToolNotice>
    <div className="mt-columns">
      <ToolSection title="คำขอและความช่วยเหลือที่เลือก">
        {requests.length ? <div className="mt-row-stack">{requests.map((row) => <article className="mt-record" key={row.id}>
          <div className="mt-record-heading"><h3>{row.preference}</h3><ToolStatus>{requestStatus[row.status]}</ToolStatus></div>
          <small>{dateLabel(row.createdAt, true)}</small>{row.topic && <p>{row.topic}</p>}
          <div className="mt-actions"><Link className="mt-button mt-button--small" to={`/teacher/requests?id=${row.id}`}>เปิดคำขอ</Link><Link className="mt-button mt-button--small mt-button--quiet" to={`/teacher/care?request=${row.id}`}>เส้นทางการดูแล</Link></div>
        </article>)}</div> : <ToolEmpty title="ยังไม่มีคำขอจากนักเรียนคนนี้" icon={HeartHandshake} />}
      </ToolSection>
      <ToolSection title="ข้อมูลที่นักเรียนแชร์" description="แสดงเฉพาะข้อมูลที่ยังเปิดให้คุณครูเข้าดู">
        {shared.length ? <div className="mt-row-stack">{shared.map((item) => <article className="mt-record" key={item.id}>
          <div className="mt-record-heading"><h3>{item.label}</h3><ToolStatus tone="mint">{sharedNames[item.kind]}</ToolStatus></div>
          <small>{dateLabel(item.createdAt, true)}</small>
          {item.text && <p className="mt-preserve">{item.text}</p>}
          {item.src && (item.kind === 'drawing' || item.kind === 'image') && <img className="mt-shared-preview" src={item.src} alt={item.label} />}
          {item.src && item.kind === 'voice' && <audio controls preload="metadata" src={item.src} aria-label={item.label} />}
        </article>)}</div> : <ToolEmpty title="ยังไม่มีข้อมูลที่แชร์" icon={Image}>ข้อมูลจะปรากฏเมื่อนักเรียนเลือกเปิดให้คุณครูดู</ToolEmpty>}
      </ToolSection>
      <ToolSection title="ประวัติการสนทนา">
        {conversations.length ? <div className="mt-row-stack">{conversations.map((row) => {
          const messages = state.messages.filter((message) => message.conversationId === row.id).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
          return <article className="mt-record" key={row.id}>
            <div className="mt-record-heading"><h3>บทสนทนากับ{student.name}</h3><small>{dateLabel(messages[0]?.createdAt ?? row.createdAt, true)}</small></div>
            <p>{messages.length} ข้อความ</p>
            <Link className="mt-button mt-button--small" to={`/teacher/messages?id=${row.id}`}>เปิดบทสนทนา</Link>
          </article>
        })}</div> : <ToolEmpty title="ยังไม่มีบทสนทนา" icon={MessageCircle} />}
      </ToolSection>
      <ToolSection title="ประวัตินัดหมาย">
        {appointments.length ? <div className="mt-row-stack">{appointments.map((row) => <article className="mt-record" key={row.id}><div className="mt-record-heading"><h3>{row.type}</h3><ToolStatus>{appointmentStatus[row.status]}</ToolStatus></div><p>{dateLabel(row.date)} · {row.time} น.</p><Link className="mt-button mt-button--small" to={`/teacher/appointments?id=${row.id}`}>ดูนัดหมาย</Link></article>)}</div> : <ToolEmpty title="ยังไม่มีนัดหมาย" icon={CalendarDays} />}
      </ToolSection>
      <ToolSection title="แผนและบันทึกการดูแล">
        {plans.length + notes.length > 0 ? <div className="mt-row-stack">
          {plans.map((row) => <article className="mt-record" key={row.id}><div className="mt-record-heading"><h3>{row.goal}</h3><ToolStatus tone={row.closed ? 'gray' : 'mint'}>{row.closed ? 'ปิดแผนแล้ว' : 'แผนการดูแล'}</ToolStatus></div><p>วันที่ตั้งใจติดตามผล · {dateLabel(row.date)}</p><Link className="mt-button mt-button--small" to={`/teacher/care?request=${row.requestId}&panel=plan`}>ดูแผน</Link></article>)}
          {notes.map((row) => <article className="mt-record" key={row.id}><div className="mt-record-heading"><h3>บันทึกการดูแล</h3><ToolStatus tone={row.visibility === 'private' ? 'gray' : 'mint'}>{row.visibility === 'private' ? 'เฉพาะครู' : 'แชร์ให้นักเรียน'}</ToolStatus></div><p className="mt-preserve">{row.text}</p><small>{dateLabel(row.createdAt, true)}</small></article>)}
        </div> : <ToolEmpty title="ยังไม่มีแผนหรือบันทึกการดูแล" icon={ClipboardList} />}
      </ToolSection>
      <ToolSection title="ติดตามผลและส่งต่อ">
        {followUps.length + referrals.length > 0 ? <ol className="mt-timeline">
          {followUps.map((row) => <li key={row.id}><div><strong>{row.title}</strong><small>{dateLabel(row.date)} · {row.completed ? 'ติดตามแล้ว' : 'รอติดตาม'}</small><Link to={`/teacher/care?request=${row.requestId}&panel=followup`}>ดูรายการติดตามผล</Link></div></li>)}
          {referrals.map((row) => <li key={row.id}><div><strong>ส่งต่อจำลอง · {row.destination}</strong><small>{dateLabel(row.date)} · {row.status === 'closed' ? 'ปิดรายการแล้ว' : row.status === 'review' ? 'กำลังพิจารณา' : row.status === 'draft' ? 'ร่าง' : 'บันทึกแล้ว'}</small><Link to={`/teacher/care?request=${row.requestId}&panel=referral`}>ดูรายละเอียดการส่งต่อ</Link></div></li>)}
        </ol> : <ToolEmpty title="ยังไม่มีรายการติดตามหรือส่งต่อ" icon={CalendarDays} />}
      </ToolSection>
    </div>
  </>
}

export function StudentManagement() {
  const { state } = useDemo()
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('')
  const [classroom, setClassroom] = useState('')
  const [status, setStatus] = useState('')
  const activeId = params.get('student') ?? params.get('id')
  const assigned = new Set(state.assignments.filter((row) => row.teacherId === state.teacherId).map((row) => row.studentId))
  const students = state.students.filter((student) => assigned.has(student.id))
  const requests = requestsFor(state, 'teacher')
  const activeStudent = students.find((student) => student.id === activeId)
  const visible = students.filter((student) => (
    (!grade || student.grade === grade) && (!classroom || student.classroom === classroom) &&
    (!status || (getLatest(requests, student.id)?.status ?? 'none') === status) &&
    `${student.name} ${student.classroom} ${student.grade}`.includes(query.trim())
  ))

  if (activeStudent) return <div className="mb-teacher-tools"><StudentProfile student={activeStudent} /></div>
  if (activeId) return <div className="mb-teacher-tools">
    <ToolHeading icon={ShieldCheck} label="นักเรียนในความดูแล" title="เปิดข้อมูลนักเรียนไม่ได้" description="คุณครูเปิดข้อมูลของนักเรียนที่อยู่ในรายการดูแลได้จากหน้านักเรียนในความดูแล" />
    <div className="mt-actions"><Link className="mt-button mt-button--primary" to="/teacher/students">กลับไปรายการนักเรียน</Link></div>
  </div>

  return <div className="mb-teacher-tools">
    <ToolHeading icon={UsersRound} label="มุมมองคุณครู" title="นักเรียนในความดูแล" description="ค้นหานักเรียนและดูประวัติการดูแลที่คุณครูเข้าถึงได้ในเดโม" />
    <ToolSection title="รายการนักเรียน" description={`แสดง ${visible.length} จาก ${students.length} คน`}>
      <div className="mt-form mt-filter-grid">
        <label>ค้นหานักเรียน <span className="mt-search"><Search size={17} aria-hidden="true" /><input type="search" placeholder="ชื่อหรือห้องเรียน" value={query} onChange={(event) => setQuery(event.currentTarget.value)} /></span></label>
        <label>ระดับชั้น <select value={grade} onChange={(event) => setGrade(event.currentTarget.value)}><option value="">ทุกระดับชั้น</option>{[...new Set(students.map((student) => student.grade))].map((entry) => <option key={entry}>{entry}</option>)}</select></label>
        <label>ห้องเรียน <select value={classroom} onChange={(event) => setClassroom(event.currentTarget.value)}><option value="">ทุกห้องเรียน</option>{[...new Set(students.map((student) => student.classroom))].map((entry) => <option key={entry}>{entry}</option>)}</select></label>
        <label>สถานะการดูแล <select value={status} onChange={(event) => setStatus(event.currentTarget.value)}><option value="">ทุกสถานะ</option><option value="none">ยังไม่มีคำขอ</option>{(Object.entries(requestStatus) as [RequestStatus, string][]).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
      </div>
      {visible.length ? <div className="mt-student-grid">{visible.map((student, index) => {
        const latest = getLatest(requests, student.id)
        const latestDate = latest?.events.map((event) => event.date).sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? latest?.createdAt
        return <article className="mt-record mt-student-card" key={student.id}>
          <span className={`mt-avatar mt-icon--${['purple', 'mint', 'blue', 'pink'][index % 4]}`} aria-hidden="true">{student.avatar || student.name.slice(0, 1)}</span>
          <div><h3>{student.name}</h3><p>{student.grade} · {student.classroom}</p></div>
          <ToolStatus tone={latest && latest.status !== 'closed' ? 'purple' : 'gray'}>{latest ? requestStatus[latest.status] : 'ยังไม่มีคำขอ'}</ToolStatus>
          <small>{latestDate ? `กิจกรรมล่าสุด ${dateLabel(latestDate)}` : 'ยังไม่มีกิจกรรมการดูแล'}</small>
          <Link className="mt-button mt-button--small" to={`/teacher/students?student=${student.id}`}>เปิดข้อมูลการดูแลของ{student.name}</Link>
        </article>
      })}</div> : <ToolEmpty title="ไม่พบนักเรียนตามตัวกรอง" icon={Search}>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</ToolEmpty>}
    </ToolSection>
  </div>
}
