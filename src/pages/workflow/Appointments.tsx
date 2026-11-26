import { useState, type FormEvent } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Plus, X } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { Appointment, AppointmentStatus, DemoState, Role } from '../../types/demo'
import { activeAppointment, appointmentStatus, appointmentsFor, forTeacher, formatDate, formatTime, requestsFor, STUDENT_ID, weekday } from '../../utils/demo'
import { Avatar, Back, Empty, Hint, PageHead, Review, Status, addDay, appointmentTypes, bkkDay, dateLabel } from './ui'

const appointmentTones: Record<AppointmentStatus, string> = {
  pending: 'amber', confirmed: 'green', proposed: 'pink', declined: 'gray', cancelled: 'gray', completed: '',
}
const calendarDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
const scheduleLabel = (row: Appointment) => `${dateLabel(row.date)} · ${row.time} น.`

function AppointmentPill({ status }: { status: AppointmentStatus }) {
  return <Status tone={appointmentTones[status]}>{appointmentStatus[status]}</Status>
}

function calendarMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 7)
}

function Calendar({ initialDate, selected, onSelect, marked = [], disabled }: {
  initialDate: string; selected: string; onSelect: (value: string) => void; marked?: string[]; disabled?: (value: string) => boolean
}) {
  const [month, setMonth] = useState(initialDate.slice(0, 7))
  const [year, number] = month.split('-').map(Number)
  const first = month + '-01'
  const start = weekday(first)
  const total = new Date(Date.UTC(year, number, 0)).getUTCDate()
  return <div className="wf-calendar">
    <div className="wf-calendar-head">
      <button type="button" className="wf-icon-button" aria-label="เดือนก่อนหน้า" onClick={() => setMonth(calendarMonth(year, number - 1))}><ChevronLeft size={18} /></button>
      <strong aria-live="polite">{formatDate(first, { month: 'long', year: 'numeric' })}</strong>
      <button type="button" className="wf-icon-button" aria-label="เดือนถัดไป" onClick={() => setMonth(calendarMonth(year, number + 1))}><ChevronRight size={18} /></button>
    </div>
    <div className="wf-calendar-grid">
      {calendarDays.map((day) => <span className="wf-calendar-weekday" key={day}>{day}</span>)}
      {Array.from({ length: start }, (_, index) => <span key={'start-' + index} />)}
      {Array.from({ length: total }, (_, index) => {
        const day = month + '-' + String(index + 1).padStart(2, '0')
        return <button className="wf-calendar-day" key={day} type="button" disabled={disabled?.(day)} aria-pressed={selected === day} aria-current={day === bkkDay() ? 'date' : undefined} aria-label={dateLabel(day) + (marked.includes(day) ? ' มีนัดหมาย' : '')} onClick={() => onSelect(day)}>
          {index + 1}{marked.includes(day) && <span aria-hidden="true" />}
        </button>
      })}
    </div>
  </div>
}

export function Appointments({ role }: { role: Role }) {
  const { state } = useDemo()
  const [params] = useSearchParams()
  const appointments = appointmentsFor(state, role)
  const edit = appointments.find((row) => row.id === params.get('edit') && activeAppointment(row.status))
  const selected = appointments.find((row) => row.id === params.get('id'))
  if (params.get('new') === '1' || edit) return <AppointmentEditor role={role} edit={edit} params={params} key={role + (role === 'teacher' ? state.teacherId : '') + params.toString()} />
  if (selected) return <AppointmentDetail appointment={selected} role={role} key={selected.id} />
  return <AppointmentOverview role={role} appointments={appointments} />
}

function AppointmentOverview({ role, appointments }: { role: Role; appointments: Appointment[] }) {
  const { state } = useDemo()
  const [activeOnly, setActiveOnly] = useState(true)
  const [day, setDay] = useState('')
  const rows = appointments.filter((row) => (!day || row.date === day) && activeAppointment(row.status) === activeOnly)
    .sort((a, b) => activeOnly ? `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`) : `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))

  return <div className="wf">
    <PageHead title="นัดหมาย" icon={CalendarDays} description={role === 'student' ? 'เลือกช่วงเวลาที่สะดวกและคุยกับคุณครูตามความพร้อม' : 'จัดการคำขอนัดหมายและดูตารางพูดคุยกับนักเรียน'}
      actions={<Link className="wf-button wf-primary" to={`/${role}/appointments?new=1`}><Plus size={17} /> {role === 'student' ? 'ขอนัดหมาย' : 'สร้างนัดหมาย'}</Link>} />
    <div className="wf-split wf-schedule-grid">
      <section className="wf-card">
        <div className="wf-group-head"><h2>ปฏิทิน</h2>{day && <button type="button" className="wf-text-button" onClick={() => setDay('')}>ดูทุกวัน</button>}</div>
        <Calendar initialDate={bkkDay()} selected={day} onSelect={(value) => setDay(value === day ? '' : value)} marked={appointments.filter((row) => activeAppointment(row.status) === activeOnly).map((row) => row.date)} />
        <p className="wf-subtle"><Clock size={15} className="wf-inline-icon" /> เวลาในปฏิทินเป็นเวลาไทย</p>
      </section>
      <section className="wf-card">
        <div className="wf-group-head"><h2>{day ? dateLabel(day) : 'รายการนัดหมาย'}</h2><Status>{rows.length} รายการ</Status></div>
        <div className="wf-tabs" aria-label="ประเภทการนัดหมาย">
          <button type="button" className="wf-tab" aria-pressed={activeOnly} onClick={() => setActiveOnly(true)}>กำลังดำเนินการ</button>
          <button type="button" className="wf-tab" aria-pressed={!activeOnly} onClick={() => setActiveOnly(false)}>ประวัติ</button>
        </div>
        {rows.length ? <div className="wf-row-list">{rows.map((row, index) => {
          const person = role === 'student' ? state.teachers.find((entry) => entry.id === row.teacherId) : state.students.find((entry) => entry.id === row.studentId)
          return <Link className="wf-row" key={row.id} to={`/${role}/appointments?id=${row.id}`}>
            <div className="wf-row-main"><Avatar name={person?.name || 'นัดหมาย'} avatar={person?.avatar} skin={index} />
              <div><strong>{person?.name} · {row.type}</strong><small>{scheduleLabel(row)}</small></div></div><AppointmentPill status={row.status} />
          </Link>
        })}</div> : <Empty title={day ? 'วันนี้ยังไม่มีรายการนัดหมาย' : 'ยังไม่มีรายการนัดหมาย'} text={day ? 'ลองเลือกวันอื่นหรือแสดงนัดหมายทุกวัน' : 'เมื่อมีนัดหมาย รายการจะแสดงที่นี่'} icon={CalendarDays} />}
      </section>
    </div>
    <Hint>การนัดหมายเกิดขึ้นในสาธิต ข้อมูลเวลาและคำขอจะปรากฏทั้งในมุมมองนักเรียนและคุณครูที่เกี่ยวข้อง</Hint>
  </div>
}

function AppointmentDetail({ appointment, role }: { appointment: Appointment; role: Role }) {
  const { state, actions, toast, confirm } = useDemo()
  const base = `/${role}/appointments`
  const student = state.students.find((row) => row.id === appointment.studentId)
  const teacher = state.teachers.find((row) => row.id === appointment.teacherId)
  const canApprove = role === 'teacher' ? appointment.status === 'pending' && appointment.requestedBy === 'student' : appointment.status === 'proposed'
  const canEdit = activeAppointment(appointment.status)
  const applyStatus = (status: AppointmentStatus) => {
    if (actions.setAppointmentStatus(appointment.id, status, role)) toast('อัปเดตการนัดหมายในสาธิตแล้ว')
    else toast('อัปเดตนัดหมายไม่ได้ ช่วงเวลานี้อาจมีการจองแล้ว')
  }
  async function cancel() {
    if (await confirm({ title: 'ยกเลิกนัดหมาย', message: 'ยกเลิกนัดหมายนี้ในสาธิตใช่ไหม?', label: 'ยกเลิกนัดหมาย' })) applyStatus('cancelled')
  }

  return <div className="wf">
    <Back to={base}>นัดหมายทั้งหมด</Back>
    <PageHead title={appointment.type} description={scheduleLabel(appointment)} icon={CalendarDays} actions={<AppointmentPill status={appointment.status} />} />
    <div className="wf-split">
      <section className="wf-card"><h2>รายละเอียดนัดหมาย</h2>
        <Review items={[['คุณครู', teacher?.name], ['นักเรียน', student?.name], ['วันและเวลา', scheduleLabel(appointment)], ['รูปแบบ', appointment.type], ['ข้อความเพิ่มเติม', appointment.note]]} />
        {appointment.requestId && <Link className="wf-back" to={role === 'student' ? '/student/journey?id=' + appointment.requestId : '/teacher/requests?id=' + appointment.requestId}>ดูคำขอความช่วยเหลือที่เกี่ยวข้อง</Link>}
      </section>
      <aside className="wf-card wf-request-actions">
        <h2>จัดการนัดหมาย</h2>
        {canApprove && <><button className="wf-button wf-primary" type="button" onClick={() => applyStatus('confirmed')}><Check size={17} /> ยืนยันนัดหมาย</button>
          <button type="button" className="wf-button" onClick={() => applyStatus('declined')}><X size={17} /> {role === 'student' ? 'ปฏิเสธเวลาใหม่' : 'ปฏิเสธคำขอ'}</button></>}
        {canEdit && <><Link className="wf-button" to={base + '?edit=' + appointment.id}><CalendarDays size={17} /> {role === 'teacher' ? 'เสนอเวลาใหม่' : 'ขอเปลี่ยนเวลานัด'}</Link>
          <button type="button" className="wf-button wf-danger" onClick={cancel}>ยกเลิกนัดหมาย</button></>}
        {role === 'teacher' && appointment.status === 'confirmed' && <button type="button" className="wf-button" onClick={() => applyStatus('completed')}>ทำเครื่องหมายว่าเสร็จสิ้น</button>}
        {!canEdit && <p>บันทึกนี้อยู่ในประวัติการนัดหมาย</p>}
      </aside>
    </div>
  </div>
}

function slotsFor(state: DemoState, teacherId: string, date: string) {
  const availability = state.availability.find((row) => row.teacherId === teacherId)
  if (!date || !availability?.available || !availability.weekdays.includes(weekday(date))) return []
  return [...new Set(availability.slots.filter((row) => row.day === weekday(date)).map((row) => row.time))].sort()
}

function occupied(state: DemoState, teacherId: string, date: string, time: string, editId?: string) {
  return state.appointments.some((row) => row.id !== editId && row.teacherId === teacherId && row.date === date && row.time === time && activeAppointment(row.status))
}

function nearestDate(state: DemoState, teacherId: string) {
  const today = bkkDay()
  for (let day = 1; day <= 14; day += 1) {
    const date = addDay(today, day)
    if (slotsFor(state, teacherId, date).some((time) => !occupied(state, teacherId, date, time))) return date
  }
  return addDay(today, 1)
}

function AppointmentEditor({ role, edit, params }: { role: Role; edit?: Appointment; params: URLSearchParams }) {
  const { state, actions, toast } = useDemo()
  const navigate = useNavigate()
  const base = `/${role}/appointments`
  const relatedRequests = requestsFor(state, role)
  const request = relatedRequests.find((row) => row.id === (edit?.requestId || params.get('request')))
  const activeTeacher = forTeacher(state)
  const linkedTeacher = state.teachers.find((row) => row.id === params.get('teacher'))
  const teachersForForm = state.teachers.filter((row) => role === 'student' || row.id === activeTeacher.id)
  const studentsForForm = state.students.filter((row) => state.assignments.some((assignment) => assignment.teacherId === activeTeacher.id && assignment.studentId === row.id))
  const [teacherId, setTeacherId] = useState(edit?.teacherId || request?.teacherId || (role === 'student' ? linkedTeacher?.id : activeTeacher.id) || teachersForForm[0]?.id || '')
  const [studentId, setStudentId] = useState(edit?.studentId || request?.studentId || (role === 'student' ? STUDENT_ID : studentsForForm.find((row) => row.id === params.get('student'))?.id || studentsForForm[0]?.id || ''))
  const [date, setDate] = useState(edit?.date || nearestDate(state, teacherId))
  const [time, setTime] = useState(edit?.time || '')
  const [type, setType] = useState(edit?.type || appointmentTypes[0])
  const [note, setNote] = useState(edit?.note || '')
  const [error, setError] = useState('')
  const [calendarRevision, setCalendarRevision] = useState(0)
  const today = bkkDay()
  const availability = state.availability.find((row) => row.teacherId === teacherId)
  const teacher = state.teachers.find((row) => row.id === teacherId)
  const currentTime = formatTime(new Date().toISOString())
  const isFuture = (day: string, slot: string) => day > today || (day === today && slot > currentTime)
  const slots = slotsFor(state, teacherId, date).filter((slot) => isFuture(date, slot))
  const dateHasSlots = (value: string) => slotsFor(state, teacherId, value).some((slot) => isFuture(value, slot) && !occupied(state, teacherId, value, slot, edit?.id))
  const allowedSlots = slots.filter((slot) => !occupied(state, teacherId, date, slot, edit?.id))
  const canSave = Boolean(teacherId && studentId && date && time && isFuture(date, time) && (role === 'teacher' || allowedSlots.includes(time)))

  function changeDate(value: string, updateCalendar = false) {
    setDate(value)
    setTime('')
    setError('')
    if (updateCalendar) setCalendarRevision((current) => current + 1)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!canSave) return
    if (occupied(state, teacherId, date, time, edit?.id)) {
      setError('ช่วงเวลานี้มีการจองแล้ว กรุณาเลือกช่วงเวลาอื่น')
      return
    }
    let requestId: string | undefined = request?.id
    if (!requestId) requestId = relatedRequests
      .filter((row) => row.teacherId === teacherId && row.studentId === studentId && row.status !== 'closed')
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]?.id
    const status = role === 'student' ? 'pending' : edit ? 'proposed' : 'confirmed'
    const appointmentId = actions.saveAppointment({ studentId, teacherId, requestId, date, time, type, requestedBy: role, note: note.trim() }, edit?.id, status)
    if (appointmentId) {
      toast(role === 'student' ? 'ส่งคำขอนัดหมายในสาธิตแล้ว' : edit ? 'เสนอเวลาใหม่ให้นักเรียนแล้ว' : 'สร้างนัดหมายในสาธิตแล้ว')
      navigate(base + '?id=' + appointmentId, { replace: true })
    } else setError('บันทึกนัดหมายไม่สำเร็จ กรุณาตรวจสอบวันและเวลาอีกครั้ง')
  }

  return <div className="wf">
    <Back to={edit ? base + '?id=' + edit.id : base}>กลับไปที่นัดหมาย</Back>
    <PageHead title={edit ? role === 'teacher' ? 'เสนอเวลาใหม่' : 'ขอเปลี่ยนเวลานัด' : role === 'teacher' ? 'สร้างนัดหมาย' : 'ขอนัดหมาย'} icon={CalendarDays}
      description="เลือกวัน เวลา และรูปแบบที่สะดวก เวลาที่แสดงเป็นเวลาไทย" />
    <form className="wf-split wf-schedule-grid" onSubmit={submit}>
      <section className="wf-card">
        <h2>เลือกวันและเวลา</h2>
        <div className="wf-grid">
          {role === 'student' ? <label className="wf-field">คุณครู<select value={teacherId} onChange={(event) => { setTeacherId(event.target.value); changeDate(nearestDate(state, event.target.value), true) }} disabled={!!request || !!edit} required>
            {teachersForForm.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label> :
            <label className="wf-field">นักเรียน<select value={studentId} onChange={(event) => setStudentId(event.target.value)} disabled={!!request || !!edit} required>
              {!studentsForForm.length && <option value="">ยังไม่มีนักเรียนในความดูแล</option>}
              {studentsForForm.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.classroom}</option>)}</select></label>}
          <label className="wf-field">วันที่นัดหมาย<input type="date" lang="th" value={date} min={today} onChange={(event) => changeDate(event.target.value, true)} required /></label>
        </div>
        <Calendar key={calendarRevision} initialDate={date || today} selected={date} onSelect={changeDate} disabled={(value) => value < today || (role === 'student' && !dateHasSlots(value))} />
        {role === 'student' ? <div className="wf-stack">
          <label className="wf-field">ช่วงเวลาที่ว่าง<select value={time} onChange={(event) => { setTime(event.target.value); setError('') }} disabled={!allowedSlots.length} required>
            <option value="">เลือกเวลา</option>{slots.map((value) => <option key={value} value={value} disabled={!allowedSlots.includes(value)}>{value} น.{allowedSlots.includes(value) ? '' : ' · มีการจองแล้ว'}</option>)}
          </select></label>
          {teacher?.appointmentPreference && <p className="wf-subtle">{teacher.appointmentPreference}</p>}
          {!allowedSlots.length && <p>{availability?.available ? 'วันนี้ไม่มีช่วงเวลาว่าง ลองเลือกวันอื่นได้เลย' : 'คุณครูพักรับนัดหมาย เธอยังส่งคำขอความช่วยเหลือได้'}</p>}
        </div> : <label className="wf-field">เวลานัดหมาย<input type="time" value={time} onChange={(event) => { setTime(event.target.value); setError('') }} required /></label>}
      </section>
      <section className="wf-card">
        <h2>รายละเอียดนัดหมาย</h2>
        <label className="wf-field">รูปแบบการนัดหมาย<select value={type} onChange={(event) => setType(event.target.value)}>{appointmentTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="wf-field">ข้อความเพิ่มเติม (ข้ามได้)<textarea maxLength={650} value={note} onChange={(event) => setNote(event.target.value)} placeholder="บอกสิ่งที่อยากคุยเท่าที่สะดวก" /></label>
        <Hint>{role === 'student' ? 'หลังส่งคำขอ คุณครูจะยืนยันหรือเสนอช่วงเวลาใหม่ได้ในสาธิต' : edit ? 'นักเรียนจะได้รับเวลาใหม่เพื่อยืนยันในสาธิต' : 'นัดหมายนี้จะปรากฏในมุมมองนักเรียนสมมติ'}</Hint>
        {error && <p className="wf-error" role="alert">{error}</p>}
        <button className="wf-button wf-primary" type="submit" disabled={!canSave}><CalendarDays size={17} /> {role === 'student' ? 'ส่งคำขอนัดหมาย' : edit ? 'ส่งเวลาใหม่ในสาธิต' : 'ยืนยันการสร้างนัดหมาย'}</button>
      </section>
    </form>
  </div>
}
