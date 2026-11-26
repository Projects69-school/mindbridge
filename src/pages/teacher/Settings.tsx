import { useState, type FormEvent } from 'react'
import { Accessibility, Bell, CalendarClock, ChevronDown, Eye, EyeOff, Flag, LockKeyhole, Plus, RotateCcw, Settings2, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { AvailabilitySlot, DemoUser, Role, SharedItem, Student, Teacher, TeacherAvailability } from '../../types/demo'
import { forStudent, forTeacher, id, now } from '../../utils/demo'
import { dateLabel, ToolEmpty, ToolHeading, ToolNotice, ToolSection, ToolStatus } from './ToolUI'

const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์']
const weekdays = [1, 2, 3, 4, 5, 6, 0]
const notificationOptions = [
  ['request', 'คำขอและสถานะการดูแล'],
  ['message', 'ข้อความใหม่'],
  ['appointment', 'นัดหมาย'],
  ['followup', 'รายการติดตามผล'],
  ['referral', 'การส่งต่อจำลอง'],
  ['feedback', 'ความคิดเห็นจากนักเรียน'],
  ['shared', 'ข้อมูลที่นักเรียนเลือกแชร์'],
] as const
const avatars = ['🌷', '🌸', '🌻', '🌱', '🌿', '☀️', '🌼', '🪻']
const grades = Array.from({ length: 6 }, (_, index) => `มัธยมศึกษาปีที่ ${index + 1}`)
const methods = ['ส่งข้อความ', 'นัดพบเป็นส่วนตัว', 'นัดโทรพูดคุย']
const sharingKind: Record<SharedItem['kind'], string> = { emotion: 'ข้อมูลอารมณ์ที่เลือก', journal: 'ข้อความบางส่วนจากบันทึก', drawing: 'ภาพวาด', voice: 'เสียง', image: 'ภาพ' }

function AvailabilityForm({ initial }: { initial: TeacherAvailability }) {
  const { actions, toast } = useDemo()
  const [value, setValue] = useState(initial)
  const [slotDay, setSlotDay] = useState(initial.weekdays[0] ?? 1)
  const [slotTime, setSlotTime] = useState('16:00')
  const [slotError, setSlotError] = useState('')
  const [editId, setEditId] = useState('')
  const selectedSlots = [...value.slots].sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day) || a.time.localeCompare(b.time))
  const currentAddDay = value.weekdays.includes(slotDay) ? slotDay : value.weekdays[0]
  const changed = value !== initial

  function setDay(day: number, selected: boolean) {
    const next = selected ? [...value.weekdays, day] : value.weekdays.filter((entry) => entry !== day)
    setValue({ ...value, weekdays: next })
    if (!selected && editId && value.slots.some((slot) => slot.id === editId && slot.day === day)) setEditId('')
    setSlotError('')
  }

  function editSlot(slot: AvailabilitySlot) {
    setEditId(slot.id)
    setSlotDay(slot.day)
    setSlotTime(slot.time)
    setSlotError('')
    document.getElementById('mt-availability-editor')?.scrollIntoView({ block: 'nearest' })
  }

  function applySlot() {
    if (currentAddDay === undefined || !slotTime) { setSlotError('เลือกวันและเวลาที่สะดวกก่อนเพิ่มช่วงเวลา'); return }
    if (value.slots.some((slot) => slot.id !== editId && slot.day === currentAddDay && slot.time === slotTime)) { setSlotError('มีช่วงเวลานี้ในตารางแล้ว'); return }
    const slot = { id: editId || id(), day: currentAddDay, time: slotTime }
    setValue({ ...value, slots: editId ? value.slots.map((item) => item.id === editId ? slot : item) : [...value.slots, slot] })
    setEditId('')
    setSlotError('')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value.responseTime.trim()) return
    if (editId) { setSlotError('บันทึกหรือยกเลิกช่วงเวลาที่กำลังแก้ไขก่อน'); return }
    const next = { ...value, responseTime: value.responseTime.trim() }
    actions.update('availability', (rows) => rows.some((row) => row.teacherId === value.teacherId) ? rows.map((row) => row.teacherId === value.teacherId ? next : row) : [...rows, next])
    setValue(next)
    toast('อัปเดตเวลาที่สะดวกแล้ว')
  }

  return <form className="mt-form" onSubmit={save}>
    <ToolSection title="สถานะการรับนัดและเวลาตอบกลับ">
      <div className="mt-form">
        <label className="mt-toggle"><input type="checkbox" checked={value.available} onChange={(event) => setValue({ ...value, available: event.currentTarget.checked })} /><span><strong>เปิดให้นักเรียนเลือกเวลานัด</strong><small>{value.available ? 'พร้อมรับคำขอนัดหมายในช่วงเวลาที่กำหนด' : 'พักรับคำขอนัดหมายใหม่'}</small></span></label>
        <label>เวลาตอบกลับโดยประมาณในเดโม <input required maxLength={100} value={value.responseTime} onChange={(event) => setValue({ ...value, responseTime: event.currentTarget.value })} placeholder="เช่น ภายใน 1 วันเรียน" /></label>
      </div>
    </ToolSection>
    <div className="mt-columns mt-columns--editor">
      <ToolSection title="วันและเวลาที่สะดวก" description="ใช้เขตเวลากรุงเทพฯ">
        <div className="mt-form">
          <fieldset className="mt-fieldset"><legend>วันที่เปิดรับนัด</legend><div className="mt-checklist">{weekdays.map((day) => <label key={day}><input type="checkbox" checked={value.weekdays.includes(day)} onChange={(event) => setDay(day, event.currentTarget.checked)} />{days[day]}</label>)}</div></fieldset>
          <div className="mt-form mt-form--inline" id="mt-availability-editor">
            <label>วันในสัปดาห์ <select value={currentAddDay ?? ''} onChange={(event) => setSlotDay(Number(event.currentTarget.value))}><option value="" disabled>เลือกวัน</option>{weekdays.filter((day) => value.weekdays.includes(day)).map((day) => <option value={day} key={day}>{days[day]}</option>)}</select></label>
            <label>เวลา <input type="time" value={slotTime} onChange={(event) => setSlotTime(event.currentTarget.value)} /></label>
          </div>
          {slotError && <p className="mt-form-error" role="alert">{slotError}</p>}
          <div className="mt-actions">
            {editId && <button className="mt-button" type="button" onClick={() => { setEditId(''); setSlotError('') }}>ยกเลิกแก้ไขเวลา</button>}
            <button className="mt-button" type="button" disabled={currentAddDay === undefined} onClick={applySlot}><Plus size={16} aria-hidden="true" />{editId ? 'อัปเดตช่วงเวลา' : 'เพิ่มช่วงเวลา'}</button>
          </div>
        </div>
      </ToolSection>
      <ToolSection title="ตารางเวลานัดหมาย">
        {selectedSlots.length ? <div className="mt-row-stack">{weekdays.filter((day) => selectedSlots.some((slot) => slot.day === day)).map((day) => <details className="mt-slot-day" key={day} open={day === currentAddDay || undefined}>
          <summary><strong>{days[day]}</strong>{!value.weekdays.includes(day) && <ToolStatus tone="gray">ปิดรับนัด</ToolStatus>}<ChevronDown aria-hidden="true" size={17} /></summary>
          <div className="mt-row-stack">{selectedSlots.filter((slot) => slot.day === day).map((slot) => <div className="mt-row" key={slot.id}><strong>{slot.time} น.</strong><div className="mt-actions">
            <button type="button" className="mt-button mt-button--small" disabled={!value.weekdays.includes(day)} aria-label={`แก้ไขเวลา ${days[day]} ${slot.time}`} onClick={() => editSlot(slot)}>แก้ไข</button>
            <button type="button" className="mt-button mt-button--icon mt-button--danger" aria-label={`ลบช่วงเวลา ${days[day]} ${slot.time}`} onClick={() => { setValue({ ...value, slots: value.slots.filter((entry) => entry.id !== slot.id) }); if (editId === slot.id) setEditId('') }}><Trash2 size={16} aria-hidden="true" /></button>
          </div></div>)}</div>
        </details>)}</div> : <ToolEmpty title="ยังไม่ได้เพิ่มช่วงเวลา" icon={CalendarClock} />}
      </ToolSection>
    </div>
    <ToolNotice>การเปลี่ยนเวลาจะอัปเดตตัวเลือกสำหรับการนัดครั้งต่อไป นัดที่บันทึกไว้แล้วสามารถจัดการได้ในหน้านัดหมาย</ToolNotice>
    <div className="mt-actions"><button type="submit" className="mt-button mt-button--primary" disabled={!changed || !value.responseTime.trim()}>บันทึกเวลาที่สะดวก</button></div>
  </form>
}

export function Availability() {
  const { state } = useDemo()
  const teacher = forTeacher(state)
  const availability = state.availability.find((row) => row.teacherId === teacher.id) ?? { teacherId: teacher.id, available: false, weekdays: [], slots: [], responseTime: '' }
  return <div className="mb-teacher-tools"><ToolHeading icon={CalendarClock} label="ตั้งค่าสำหรับคุณครู" title="เวลาที่สะดวก" description={`ตั้งเวลารับนัดหมายของ${teacher.name} เพื่อให้นักเรียนเลือกเวลาที่ตรงกัน`} action={<Link className="mt-button" to="/teacher/settings">กลับหน้าตั้งค่า</Link>} /><AvailabilityForm key={`${teacher.id}-${state.revision}`} initial={availability} /></div>
}

function AvatarPicker({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  return <fieldset className="mt-fieldset"><legend>เลือกภาพแทนตัว</legend><div className="mt-avatar-options">{avatars.map((avatar, index) => <button type="button" className="mt-avatar mt-icon--purple" aria-label={`เลือกภาพแทนตัวแบบที่ ${index + 1}`} aria-pressed={avatar === value} key={avatar} onClick={() => onSelect(avatar)}>{avatar}</button>)}</div></fieldset>
}

function Profile({ person }: { person: Student | Teacher }) {
  const { state, actions, toast } = useDemo()
  const [name, setName] = useState(person.name)
  const [avatar, setAvatar] = useState(person.avatar)
  const [grade, setGrade] = useState(person.role === 'student' ? person.grade : '')
  const [classroom, setClassroom] = useState(person.role === 'student' ? person.classroom : '')
  const [title, setTitle] = useState(person.role === 'teacher' ? person.title : '')
  const [intro, setIntro] = useState(person.role === 'teacher' ? person.intro : '')
  const [chosenMethods, setChosenMethods] = useState(person.role === 'teacher' ? person.methods : [])
  const [appointmentPreference, setAppointmentPreference] = useState(person.role === 'teacher' ? person.appointmentPreference ?? '' : '')
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return
    if (person.role === 'student') {
      if (!classroom.trim()) return
      actions.update('students', (people) => people.map((entry) => entry.id === person.id ? { ...entry, name: name.trim(), avatar, grade, classroom: classroom.trim() } : entry))
    } else {
      if (!title.trim()) return
      actions.update('teachers', (people) => people.map((entry) => entry.id === person.id ? { ...entry, name: name.trim(), avatar, title: title.trim(), intro: intro.trim(), methods: chosenMethods, appointmentPreference: appointmentPreference.trim() } : entry))
    }
    toast('บันทึกโปรไฟล์สาธิตแล้ว')
  }
  return <div className="mt-columns mt-columns--editor">
    <ToolSection title="แก้ไขข้อมูลโปรไฟล์" description="ใช้ชื่อและรายละเอียดสมมติสำหรับเดโม">
      <form className="mt-form" onSubmit={save}>
        <label>ชื่อที่แสดง <input value={name} required maxLength={40} onChange={(event) => setName(event.currentTarget.value)} /></label>
        <AvatarPicker value={avatar} onSelect={setAvatar} />
        {person.role === 'student' ? <div className="mt-form mt-form--inline">
          <label>ระดับชั้น <select value={grade} onChange={(event) => setGrade(event.currentTarget.value)}>{grades.map((entry) => <option key={entry}>{entry}</option>)}</select></label>
          <label>ห้องเรียน <input value={classroom} required maxLength={30} placeholder="เช่น ม.5/2" onChange={(event) => setClassroom(event.currentTarget.value)} /></label>
        </div> : <>
          <label>บทบาทในโรงเรียนสมมติ <input value={title} required maxLength={70} onChange={(event) => setTitle(event.currentTarget.value)} /></label>
          <label>ข้อความแนะนำตัวสำหรับนักเรียน <textarea value={intro} maxLength={420} rows={3} onChange={(event) => setIntro(event.currentTarget.value)} /></label>
          <fieldset className="mt-fieldset"><legend>ช่องทางที่สะดวก</legend><div className="mt-checklist">{methods.map((method) => <label key={method}><input type="checkbox" checked={chosenMethods.includes(method)} onChange={(event) => setChosenMethods(event.currentTarget.checked ? [...chosenMethods, method] : chosenMethods.filter((value) => value !== method))} />{method}</label>)}</div></fieldset>
          <label>รายละเอียดเพิ่มเติมสำหรับการนัด <input value={appointmentPreference} maxLength={160} onChange={(event) => setAppointmentPreference(event.currentTarget.value)} placeholder="เช่น สะดวกช่วงหลังเลิกเรียน" /></label>
        </>}
        <div className="mt-actions"><button className="mt-button mt-button--primary" type="submit" disabled={!name.trim()}>บันทึกโปรไฟล์</button></div>
      </form>
    </ToolSection>
    <div className="mt-stack">
      <ToolSection title="โปรไฟล์ของฉัน">
        <div className="mt-profile-summary"><span className="mt-avatar mt-icon--purple" aria-hidden="true">{person.avatar}</span><div><h3>{person.name}</h3><p>{person.role === 'student' ? `${person.grade} · ${person.classroom}` : person.title}</p></div></div>
        {person.role === 'teacher' && <div className="mt-actions"><Link className="mt-button" to="/teacher/availability"><CalendarClock size={16} aria-hidden="true" /> จัดการเวลาที่สะดวก</Link></div>}
      </ToolSection>
      {person.role === 'teacher' && <ToolSection title="โปรไฟล์คุณครูในเดโม" description="สลับดูข้อมูลในความดูแลของคุณครูแต่ละคน">
        <div className="mt-form"><label>เลือกโปรไฟล์คุณครู <select value={state.teacherId} onChange={(event) => actions.setTeacher(event.currentTarget.value)}>{state.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.title}</option>)}</select></label></div>
      </ToolSection>}
    </div>
  </div>
}

function PreferenceToggle({ checked, onChange, name, detail, disabled }: { checked: boolean; onChange: (value: boolean) => void; name: string; detail?: string; disabled?: boolean }) {
  return <label className="mt-toggle"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.currentTarget.checked)} /><span><strong>{name}</strong>{detail && <small>{detail}</small>}</span></label>
}

function updatePreference(person: DemoUser, update: (partial: Partial<DemoUser>) => void, key: 'notifications' | 'largeText' | 'reducedMotion' | 'highContrast') {
  return { checked: person[key], onChange: (value: boolean) => update({ [key]: value }) }
}

function PrivacyPanel() {
  const { state, actions, toast, confirm } = useDemo()
  const student = forStudent(state)
  const shared = state.sharedItems.filter((row) => row.studentId === student.id && row.owner !== 'teacher')
  const [reason, setReason] = useState('')
  const [reporting, setReporting] = useState(false)

  async function revoke(item: SharedItem) {
    if (await confirm({ title: 'ยกเลิกการแชร์รายการนี้?', message: 'คุณครูจะเปิดรายการนี้จากเดโมไม่ได้อีก การเปลี่ยนแปลงนี้เรียกคืนสิ่งที่ผู้อื่นเคยอ่านแล้วไม่ได้', label: 'ยกเลิกการแชร์' })) {
      actions.update('sharedItems', (rows) => rows.map((row) => row.id === item.id ? { ...row, revoked: true } : row))
      toast('ยกเลิกการแชร์สำหรับการเปิดดูครั้งต่อไปแล้ว')
    }
  }

  async function clearPersonal() {
    if (!await confirm({ title: 'ล้างบันทึกส่วนตัวในเดโม?', message: 'ระบบจะลบบันทึกอารมณ์ สมุดบันทึก ภาพวาด และเสียงของเธอ สำเนาที่เคยเลือกแชร์จัดการได้ในรายการประวัติการแชร์', label: 'ล้างบันทึกส่วนตัว' })) return
    actions.update('checkIns', (rows) => rows.filter((row) => row.studentId !== student.id))
    actions.update('journals', (rows) => rows.filter((row) => row.studentId !== student.id))
    actions.update('drawings', (rows) => rows.filter((row) => row.studentId !== student.id))
    actions.update('voices', (rows) => rows.filter((row) => row.studentId !== student.id))
    toast('ล้างบันทึกส่วนตัวในเดโมแล้ว')
  }

  function report(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!reason.trim()) return
    actions.update('concerns', (rows) => [{ id: id(), role: 'student', reason: reason.trim(), createdAt: now() }, ...rows])
    setReporting(false)
    setReason('')
    toast('บันทึกข้อกังวลไว้ในเดโมแล้ว')
  }

  return <>
    <ToolNotice icon={ShieldCheck}>เดโมสาธารณะนี้แสดงตัวอย่างการแบ่งสิทธิ์ผ่านหน้าจอ ข้อมูลทั้งหมดอยู่ในหน่วยความจำของแท็บและทุกคนสามารถสลับบทบาทได้ กรุณาใช้เฉพาะข้อมูลสมมติ</ToolNotice>
    <div className="mt-columns">
      <ToolSection title="ความเป็นส่วนตัวของสมุดบันทึก">
        <div className="mt-row"><span><strong>ค่าเริ่มต้นของบันทึกใหม่</strong><small>เธอเลือกส่งสำเนาเฉพาะส่วนที่พร้อมให้คุณครูเห็นได้</small></span><ToolStatus tone="mint">เฉพาะฉัน</ToolStatus></div>
        <div className="mt-actions"><button className="mt-button mt-button--danger" type="button" onClick={() => void clearPersonal()}><Trash2 size={16} aria-hidden="true" /> ล้างบันทึกส่วนตัว</button></div>
      </ToolSection>
      <ToolSection title="ต้องการความช่วยเหลือเรื่องความเป็นส่วนตัว?">
        <p>เลือกครูคนอื่น หรือบันทึกข้อกังวลเกี่ยวกับสิทธิ์การเข้าถึงในเดโมได้ที่นี่</p>
        <div className="mt-actions"><Link className="mt-button" to="/student/teachers">ขอเปลี่ยนคุณครู</Link><button type="button" className="mt-button" onClick={() => setReporting(!reporting)} aria-expanded={reporting}><Flag size={16} aria-hidden="true" /> แจ้งข้อกังวล</button></div>
        {reporting && <form className="mt-form" onSubmit={report}><label>ข้อกังวลสมมติ <textarea required maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.currentTarget.value)} /></label><p className="mt-muted">ข้อกังวลจะถูกบันทึกไว้ในการสาธิตครั้งนี้</p><button className="mt-button mt-button--primary" type="submit" disabled={!reason.trim()}>บันทึกข้อกังวลจำลอง</button></form>}
      </ToolSection>
    </div>
    <ToolSection title="ประวัติการแชร์" description="ตรวจข้อมูลที่เลือกแชร์และยกเลิกการเข้าถึงในอนาคตได้">
      {shared.length ? <div className="mt-row-stack">{shared.map((item) => <details className="mt-slot-day" key={item.id}>
        <summary><span><strong>{item.label}</strong><small>{state.teachers.find((teacher) => teacher.id === item.teacherId)?.name} · {dateLabel(item.createdAt, true)}</small></span><ToolStatus tone={item.revoked ? 'gray' : 'mint'}>{item.revoked ? 'ยกเลิกการแชร์แล้ว' : 'เปิดให้คุณครูดู'}</ToolStatus><ChevronDown size={17} aria-hidden="true" /></summary>
        <div className="mt-stack">
          <p className="mt-muted">{sharingKind[item.kind]}</p>
          {item.text && <p className="mt-preserve">{item.text}</p>}
          {item.src && (item.kind === 'drawing' || item.kind === 'image') && <img className="mt-shared-preview" src={item.src} alt={item.label} />}
          {item.src && item.kind === 'voice' && <audio src={item.src} controls preload="metadata" aria-label={item.label} />}
          {!item.revoked && <div className="mt-actions"><button type="button" className="mt-button" onClick={() => void revoke(item)}><EyeOff size={16} aria-hidden="true" /> ยกเลิกการแชร์</button></div>}
        </div>
      </details>)}</div> : <ToolEmpty title="ยังไม่มีรายการที่แชร์" icon={Eye}>เมื่อเลือกแชร์ข้อมูล รายการจะปรากฏที่นี่</ToolEmpty>}
    </ToolSection>
  </>
}

export function Settings({ defaultTab = 'profile' }: { defaultTab?: 'profile' | 'privacy' }) {
  const { state, actions, toast, confirm } = useDemo()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const role: Role = location.pathname.startsWith('/teacher') ? 'teacher' : 'student'
  const person = role === 'teacher' ? forTeacher(state) : forStudent(state)
  const tabs = [
    { key: 'profile', label: 'โปรไฟล์', icon: UserRound },
    ...(role === 'student' ? [{ key: 'privacy', label: 'ความเป็นส่วนตัว', icon: LockKeyhole }] : []),
    { key: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
    { key: 'accessibility', label: 'การเข้าถึง', icon: Accessibility },
    { key: 'demo', label: 'การสาธิต', icon: RotateCcw },
  ]
  const requested = params.get('tab') ?? defaultTab
  const active = tabs.some((tab) => tab.key === requested) ? requested : 'profile'

  function setPreference(partial: Partial<DemoUser>) {
    if (role === 'student') actions.update('students', (rows) => rows.map((row) => row.id === person.id ? { ...row, ...partial, role: 'student' } : row))
    else actions.update('teachers', (rows) => rows.map((row) => row.id === person.id ? { ...row, ...partial, role: 'teacher' } : row))
  }

  async function reset() {
    if (!await confirm({ title: 'เริ่มการสาธิตใหม่?', message: 'การเปลี่ยนแปลงทั้งหมดในแท็บนี้จะถูกล้าง และข้อมูลสมมติเริ่มต้นจะกลับมา', label: 'เริ่มการสาธิตใหม่' })) return
    actions.reset()
    toast('คืนค่าข้อมูลสมมติเริ่มต้นแล้ว')
  }

  return <div className="mb-teacher-tools">
    <ToolHeading icon={Settings2} label={role === 'teacher' ? 'มุมมองคุณครู' : 'พื้นที่ของฉัน'} title="ตั้งค่า" description="จัดการโปรไฟล์ การแจ้งเตือน และรูปแบบการแสดงผลในเดโม" />
    <div className="mt-tabs mt-settings-tabs" aria-label="หมวดการตั้งค่า">{tabs.map(({ key, label, icon: Icon }) => <button type="button" className="mt-tab" aria-pressed={key === active} onClick={() => setParams({ tab: key })} key={key}><Icon size={17} aria-hidden="true" />{label}</button>)}</div>
    {active === 'profile' && <Profile key={`${person.id}-${state.revision}`} person={person} />}
    {active === 'privacy' && <PrivacyPanel key={state.revision} />}
    {active === 'notifications' && <ToolSection title="ตั้งค่าการแจ้งเตือน" description="การตั้งค่ามีผลกับการแจ้งเตือนใหม่ในเดโม">
      <div className="mt-stack">
        <PreferenceToggle {...updatePreference(person, setPreference, 'notifications')} name="เปิดการแจ้งเตือนในแอป" detail="ดูข้อความเตือนในศูนย์การแจ้งเตือนของบทบาทนี้" />
        {notificationOptions.filter(([key]) => role === 'teacher' || !['feedback', 'shared'].includes(key)).map(([key, label]) => <PreferenceToggle key={key} name={label} checked={person.notificationTypes?.[key] ?? true} disabled={!person.notifications} onChange={(checked) => setPreference({ notificationTypes: { ...person.notificationTypes, [key]: checked } })} />)}
      </div>
    </ToolSection>}
    {active === 'accessibility' && <ToolSection title="ตั้งค่าการเข้าถึง" description="เลือกวิธีแสดงผลที่อ่านและใช้งานได้สะดวก">
      <div className="mt-stack">
        <PreferenceToggle {...updatePreference(person, setPreference, 'largeText')} name="เพิ่มขนาดข้อความ" detail="ขยายข้อความในมุมมองของบทบาทนี้" />
        <PreferenceToggle {...updatePreference(person, setPreference, 'highContrast')} name="เพิ่มความเปรียบต่าง" detail="ทำให้ข้อความและองค์ประกอบสำคัญมองเห็นชัดขึ้น" />
        <PreferenceToggle {...updatePreference(person, setPreference, 'reducedMotion')} name="ลดการเคลื่อนไหว" detail="ลดภาพเคลื่อนไหวและเอฟเฟกต์เปลี่ยนหน้าจอ" />
      </div>
    </ToolSection>}
    {active === 'demo' && <ToolSection title="จัดการการสาธิต" description="สลับบทบาทเพื่อดูผลการทำงานจากทั้งสองฝั่ง">
      <div className="mt-actions"><Link className="mt-button" to={`/${role === 'student' ? 'teacher' : 'student'}/dashboard`}>{role === 'student' ? 'สลับไปบัญชีครู' : 'สลับไปบัญชีนักเรียน'}</Link><Link className="mt-button" to="/">กลับหน้าหลัก</Link><button type="button" className="mt-button mt-button--danger" onClick={() => void reset()}><RotateCcw size={16} aria-hidden="true" /> เริ่มการสาธิตใหม่</button></div>
    </ToolSection>}
  </div>
}

export function Privacy() { return <Settings defaultTab="privacy" /> }
