import { useState, type FormEvent } from 'react'
import { Activity, ArrowLeft, CalendarDays, Check, ClipboardList, HeartHandshake, MessageCircle, NotebookPen, Plus, Send, ShieldCheck, Trash2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { ActionItem, FollowUp, Referral, SupportNote, SupportPlan, SupportRequest } from '../../types/demo'
import { id, now, offsetDate, requestsFor, requestStatus } from '../../utils/demo'
import { dateKey, dateLabel, ToolEmpty, ToolHeading, ToolNotice, ToolSection, ToolStatus } from './ToolUI'

type CarePanel = 'timeline' | 'plan' | 'followup' | 'notes' | 'referral'

const sections = [
  { key: 'timeline', label: 'ภาพรวม', icon: Activity },
  { key: 'plan', label: 'แผนการดูแล', icon: ClipboardList },
  { key: 'followup', label: 'ติดตามผล', icon: CalendarDays },
  { key: 'notes', label: 'บันทึกของครู', icon: NotebookPen },
  { key: 'referral', label: 'ส่งต่อผู้เชี่ยวชาญ', icon: Send },
] as const

const lifecycle = [
  { key: 'new', title: 'ส่งคำขอ' },
  { key: 'accepted', title: 'ครูรับเรื่อง' },
  { key: 'talking', title: 'พูดคุย' },
  { key: 'planned', title: 'วางแผนดูแล' },
  { key: 'followup', title: 'ติดตามผล' },
  { key: 'referred', title: 'ส่งต่อหรือปิดเรื่อง' },
] as const

const planActions = ['รับฟังและสะท้อนความรู้สึก', 'ร่วมกันหาทางเลือก', 'ช่วยวางแผนการเรียน', 'ประสานการช่วยเหลือ', 'นัดติดตามผล']
const destinations = ['ครูแนะแนว', 'นักจิตวิทยาประจำโรงเรียน', 'ผู้เชี่ยวชาญด้านสุขภาพจิต', 'ผู้รับผิดชอบด้านการคุ้มครองนักเรียน']
const referralFields = ['ชื่อสมมติและห้องเรียน', 'ความช่วยเหลือที่นักเรียนเลือก', 'สรุปแผนดูแลที่กำลังใช้']
const referralStatuses = { draft: 'ร่าง', sent: 'ส่งต่อในการสาธิตแล้ว', review: 'กำลังพิจารณา', closed: 'ปิดรายการแล้ว' }

function recordIdentity({ id: requestId, studentId, teacherId }: SupportRequest) {
  return { id: id(), requestId, studentId, teacherId, createdAt: now() }
}

function ItemEditor({ items, onChange, label }: { items: ActionItem[]; onChange: (items: ActionItem[]) => void; label: string }) {
  return <fieldset className="mt-fieldset">
    <legend>{label}</legend>
    {items.map((item, index) => <div className="mt-item-editor" key={item.id}>
      <input type="checkbox" aria-label={`ทำรายการที่ ${index + 1} แล้ว`} checked={item.done} onChange={(event) => {
        onChange(items.map((entry) => entry.id === item.id ? { ...item, done: event.currentTarget.checked } : entry))
      }} />
      <input type="text" value={item.text} maxLength={140} placeholder="ระบุสิ่งที่จะทำ" aria-label={`รายการที่ ${index + 1}`} onChange={(event) => {
        onChange(items.map((entry) => entry.id === item.id ? { ...item, text: event.currentTarget.value } : entry))
      }} />
      <button type="button" className="mt-button mt-button--icon" aria-label={`ลบรายการที่ ${index + 1}`} onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}><Trash2 size={16} aria-hidden="true" /></button>
    </div>)}
    <button type="button" className="mt-button mt-button--quiet" onClick={() => onChange([...items, { id: id(), text: '', done: false }])}><Plus size={17} aria-hidden="true" /> เพิ่มรายการ</button>
  </fieldset>
}

function CareTimeline({ request, selectPanel }: { request: SupportRequest; selectPanel: (panel: CarePanel) => void }) {
  const { state, actions, toast, confirm } = useDemo()
  const student = state.students.find((person) => person.id === request.studentId)
  const hasConversation = state.messages.some((row) => row.conversationId === request.conversationId)
  const hasPlan = state.plans.some((row) => row.requestId === request.id)
  const hasFollowUp = state.followUps.some((row) => row.requestId === request.id)
  const hasReferral = state.referrals.some((row) => row.requestId === request.id && row.status !== 'draft')
  const reached = [true, !!request.acceptedAt, hasConversation, hasPlan, hasFollowUp, hasReferral || request.status === 'closed']
  const active = lifecycle.findIndex((step) => step.key === (request.status === 'closed' ? 'referred' : request.status))
  const history = [...request.events].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  async function changeStatus() {
    const closing = request.status !== 'closed'
    const accepted = await confirm({
      title: closing ? 'สิ้นสุดการดูแลครั้งนี้?' : 'เปิดคำขอนี้อีกครั้ง?',
      message: closing ? 'นักเรียนจะเห็นสถานะการดูแลที่อัปเดต และคุณครูสามารถเปิดคำขออีกครั้งได้' : 'คำขอจะกลับมาอยู่ในรายการดูแลของคุณครู',
      label: closing ? 'สิ้นสุดการดูแล' : 'เปิดคำขออีกครั้ง',
    })
    const openStatus = hasFollowUp ? 'followup' : hasPlan ? 'planned' : hasConversation ? 'talking' : request.acceptedAt ? 'accepted' : 'new'
    if (accepted && actions.setRequestStatus(request.id, closing ? 'closed' : openStatus)) {
      toast(closing ? 'บันทึกการสิ้นสุดการดูแลแล้ว' : 'เปิดคำขออีกครั้งแล้ว')
    }
  }
  return <>
    <ToolSection title="เส้นทางการดูแล" description={`คำขอของ${student?.name ?? 'นักเรียน'} · ${request.preference}`} action={<ToolStatus tone={request.status === 'closed' ? 'gray' : 'purple'}>{requestStatus[request.status]}</ToolStatus>}>
      <ol className="mt-lifecycle" aria-label="ขั้นตอนการดูแล">{lifecycle.map((step, index) => {
        const complete = reached[index] && index !== active
        return <li key={step.key} className={complete ? 'is-complete' : active === index ? 'is-current' : ''} aria-current={active === index ? 'step' : undefined}><span>{complete ? <Check size={16} aria-hidden="true" /> : index + 1}</span><strong>{step.title}</strong></li>
      })}</ol>
      <div className="mt-actions">
        {request.status === 'new' && <Link className="mt-button mt-button--primary" to={`/teacher/requests?id=${request.id}`}>เปิดคำขอ</Link>}
        {request.conversationId && <Link className="mt-button" to={`/teacher/messages?id=${request.conversationId}`}><MessageCircle size={17} aria-hidden="true" /> เปิดบทสนทนา</Link>}
        {request.status !== 'new' && request.status !== 'closed' && <button className="mt-button mt-button--primary" type="button" onClick={() => selectPanel('followup')}><CalendarDays size={17} aria-hidden="true" /> นัดติดตามผล</button>}
        <button className="mt-button mt-button--quiet" type="button" onClick={() => void changeStatus()}>{request.status === 'closed' ? 'เปิดคำขออีกครั้ง' : 'สิ้นสุดการดูแล'}</button>
      </div>
    </ToolSection>
    <div className="mt-columns">
      <ToolSection title="กิจกรรมการดูแล">
        {history.length > 0 ? <ol className="mt-timeline">{history.map((event) => <li key={event.id}><div><strong>{event.title}</strong><small>{dateLabel(event.date, true)}</small>{event.detail && <p>{event.detail}</p>}</div></li>)}</ol> : <ToolEmpty title="ยังไม่มีกิจกรรมการดูแล">สถานะจะอัปเดตเมื่อเริ่มดำเนินการกับคำขอนี้</ToolEmpty>}
      </ToolSection>
      <ToolSection title="ความคิดเห็นจากนักเรียน">
        {state.feedback.some((entry) => entry.requestId === request.id && entry.teacherId === request.teacherId) ? <div className="mt-row-stack">{state.feedback.filter((entry) => entry.requestId === request.id && entry.teacherId === request.teacherId).map((entry) => <div className="mt-row mt-row--column" key={entry.id}>
          <small>{dateLabel(entry.createdAt, true)}</small>
          {Object.entries(entry.answers).map(([label, answer]) => <p key={label}>{label} · {answer}</p>)}
          {entry.text && <p className="mt-preserve">{entry.text}</p>}
        </div>)}</div> : <ToolEmpty title="ยังไม่มีความคิดเห็น" icon={MessageCircle}>นักเรียนเลือกได้ว่าจะส่งความคิดเห็นเมื่อพร้อมหรือไม่</ToolEmpty>}
      </ToolSection>
    </div>
  </>
}

function PlanForm({ request, draft, onSave, onCancel }: { request: SupportRequest; draft?: SupportPlan; onSave: () => void; onCancel?: () => void }) {
  const { actions, toast } = useDemo()
  const [goal, setGoal] = useState(draft?.goal ?? '')
  const [date, setDate] = useState(draft?.date ?? offsetDate(7))
  const [selected, setSelected] = useState(draft?.actions ?? [])
  const [items, setItems] = useState(draft?.items ?? [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!goal.trim()) return
    actions.savePlan({ ...(draft ?? recordIdentity(request)), goal: goal.trim(), date, actions: selected, items: items.filter((item) => item.text.trim()), closed: draft?.closed ?? false })
    toast(draft ? 'อัปเดตแผนการดูแลแล้ว' : 'สร้างแผนการดูแลแล้ว')
    setGoal('')
    setSelected([])
    setItems([])
    onSave()
  }

  return <form className="mt-form" onSubmit={submit}>
    <label>เป้าหมายการดูแล <textarea required rows={2} maxLength={450} value={goal} onChange={(event) => setGoal(event.currentTarget.value)} placeholder="เช่น ช่วยให้ฟ้ามีคนรับฟังและมีเวลาพักระหว่างเตรียมสอบ" /></label>
    <fieldset className="mt-fieldset"><legend>เลือกแนวทางช่วยเหลือ</legend><div className="mt-checklist">{planActions.map((action) => <label key={action}><input type="checkbox" checked={selected.includes(action)} onChange={(event) => setSelected(event.currentTarget.checked ? [...selected, action] : selected.filter((entry) => entry !== action))} />{action}</label>)}</div></fieldset>
    <ItemEditor items={items} onChange={setItems} label="สิ่งที่จะทำร่วมกัน" />
    <label>วันที่ตั้งใจติดตามผล <input type="date" required value={date} onChange={(event) => setDate(event.currentTarget.value)} /></label>
    <ToolNotice icon={ShieldCheck}>นักเรียนจะเห็นเป้าหมาย แนวทางช่วยเหลือ และรายการที่ตกลงทำร่วมกันในเส้นทางการดูแลของตน</ToolNotice>
    <div className="mt-actions">{onCancel && <button type="button" className="mt-button" onClick={onCancel}>ยกเลิกแก้ไข</button>}<button type="submit" className="mt-button mt-button--primary" disabled={!goal.trim()}>{draft ? 'บันทึกการแก้ไข' : 'สร้างแผนการดูแล'}</button></div>
  </form>
}

function PlansPanel({ request, editable }: { request: SupportRequest; editable: boolean }) {
  const { state, actions, toast, confirm } = useDemo()
  const [editing, setEditing] = useState<SupportPlan>()
  const plans = state.plans.filter((plan) => plan.requestId === request.id && plan.teacherId === request.teacherId)
  async function closePlan(plan: SupportPlan) {
    if (!await confirm({ title: 'ปิดแผนการดูแลนี้?', message: 'แผนจะยังแสดงในประวัติการดูแลของนักเรียน', label: 'ปิดแผน' })) return
    actions.savePlan({ ...plan, closed: true })
    if (editing?.id === plan.id) setEditing(undefined)
    toast('ปิดแผนการดูแลแล้ว')
  }

  return <div className="mt-columns mt-columns--editor">
    {editable && <ToolSection title={editing ? 'แก้ไขแผนการดูแล' : 'สร้างแผนการดูแล'}><PlanForm request={request} draft={editing} key={editing?.id ?? request.id} onSave={() => setEditing(undefined)} onCancel={editing ? () => setEditing(undefined) : undefined} /></ToolSection>}
    <ToolSection title="แผนที่บันทึกไว้">{plans.length ? <div className="mt-row-stack">{plans.map((plan) => <article className="mt-record" key={plan.id}>
      <div className="mt-record-heading"><h3>{plan.goal}</h3><ToolStatus tone={plan.closed ? 'gray' : 'mint'}>{plan.closed ? 'ปิดแผนแล้ว' : 'กำลังดำเนินการ'}</ToolStatus></div>
      <p className="mt-muted">ติดตามผล {dateLabel(plan.date)}</p>
      {plan.actions.length > 0 && <p>{plan.actions.join(' · ')}</p>}
      {plan.items.length > 0 && <div className="mt-checklist mt-checklist--vertical">{plan.items.map((item) => <label key={item.id}><input type="checkbox" checked={item.done} disabled={plan.closed || !editable} onChange={(event) => actions.savePlan({ ...plan, items: plan.items.map((entry) => entry.id === item.id ? { ...item, done: event.currentTarget.checked } : entry) })} />{item.text}</label>)}</div>}
      {!plan.closed && editable && <div className="mt-actions"><button className="mt-button mt-button--small" type="button" onClick={() => setEditing(plan)}>แก้ไขแผน</button><button className="mt-button mt-button--small mt-button--quiet" type="button" onClick={() => void closePlan(plan)}>ปิดแผน</button></div>}
    </article>)}</div> : <ToolEmpty title="ยังไม่มีแผนการดูแล" icon={ClipboardList}>บันทึกเป้าหมายและสิ่งที่ตกลงจะทำร่วมกันได้ที่นี่</ToolEmpty>}</ToolSection>
  </div>
}

function NotesPanel({ request }: { request: SupportRequest }) {
  const { state, actions, toast, confirm } = useDemo()
  const notes = state.notes.filter((note) => note.requestId === request.id && note.teacherId === request.teacherId)
  const [editing, setEditing] = useState<SupportNote>()
  const [text, setText] = useState('')
  const [followup, setFollowup] = useState('')
  const [visibility, setVisibility] = useState<SupportNote['visibility']>('private')

  function edit(note?: SupportNote) {
    setEditing(note)
    setText(note?.text ?? '')
    setFollowup(note?.followup ?? '')
    setVisibility(note?.visibility ?? 'private')
  }
  async function remove(note: SupportNote) {
    if (!await confirm({ title: 'ลบบันทึกการดูแลนี้?', message: 'บันทึกจะถูกลบออกจากการสาธิตครั้งนี้', label: 'ลบบันทึก' })) return
    actions.update('notes', (entries) => entries.filter((entry) => entry.id !== note.id))
    if (editing?.id === note.id) edit()
    toast('ลบบันทึกแล้ว')
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) return
    actions.saveNote({ ...(editing ?? recordIdentity(request)), text: text.trim(), followup: followup.trim(), visibility })
    edit()
    toast('บันทึกการดูแลแล้ว')
  }

  return <div className="mt-columns mt-columns--editor">
    <ToolSection title={editing ? 'แก้ไขบันทึกการดูแล' : 'เพิ่มบันทึกการดูแล'}>
      <form className="mt-form" onSubmit={save}>
        <label>ข้อความ <textarea required maxLength={1600} rows={4} value={text} onChange={(event) => setText(event.currentTarget.value)} /></label>
        <label>สิ่งที่อยากติดตามต่อ <textarea maxLength={500} rows={2} value={followup} onChange={(event) => setFollowup(event.currentTarget.value)} /></label>
        <label>ใครจะเห็นบันทึกนี้ <select value={visibility} onChange={(event) => setVisibility(event.currentTarget.value === 'student' ? 'student' : 'private')}><option value="private">เฉพาะครูผู้บันทึก</option><option value="student">ครูและนักเรียนในเส้นทางการดูแล</option></select></label>
        <div className="mt-actions">{editing && <button className="mt-button" type="button" onClick={() => edit()}>ยกเลิกแก้ไข</button>}<button type="submit" className="mt-button mt-button--primary" disabled={!text.trim()}>บันทึกการดูแล</button></div>
      </form>
    </ToolSection>
    <ToolSection title="บันทึกที่ผ่านมา">{notes.length ? <div className="mt-row-stack">{notes.map((note) => <article className="mt-record" key={note.id}>
      <div className="mt-record-heading"><small>{dateLabel(note.createdAt, true)}</small><ToolStatus tone={note.visibility === 'private' ? 'gray' : 'mint'}>{note.visibility === 'private' ? 'เฉพาะครู' : 'แชร์ให้นักเรียน'}</ToolStatus></div>
      <p className="mt-preserve">{note.text}</p>{note.followup && <p className="mt-muted mt-preserve">ติดตามต่อ · {note.followup}</p>}
      <div className="mt-actions"><button type="button" className="mt-button mt-button--small" onClick={() => edit(note)}>แก้ไข</button><button type="button" className="mt-button mt-button--small mt-button--danger" onClick={() => void remove(note)}>ลบ</button></div>
    </article>)}</div> : <ToolEmpty title="ยังไม่มีบันทึกการดูแล" icon={NotebookPen} />}</ToolSection>
  </div>
}

function FollowUpForm({ request, draft, initialDate, onDone }: { request: SupportRequest; draft?: FollowUp; initialDate?: string; onDone: () => void }) {
  const { actions, toast } = useDemo()
  const [title, setTitle] = useState(draft?.title ?? '')
  const [date, setDate] = useState(draft?.date ?? initialDate ?? offsetDate(3))
  const [note, setNote] = useState(draft?.note ?? '')
  const [tasks, setTasks] = useState(draft?.tasks ?? [])
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    actions.saveFollowUp({ ...(draft ?? recordIdentity(request)), title: title.trim(), date, note: note.trim(), tasks: tasks.filter((item) => item.text.trim()), completed: draft?.completed ?? false })
    toast(draft ? 'อัปเดตการติดตามผลแล้ว' : 'สร้างรายการติดตามผลแล้ว')
    setTitle('')
    setNote('')
    setTasks([])
    onDone()
  }
  return <form className="mt-form" onSubmit={save}>
    <label>หัวข้อการติดตามผล <input required value={title} maxLength={150} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="เช่น พูดคุยหลังสอบ" /></label>
    <label>วันที่ติดตามผล <input type="date" required min={draft && draft.date < dateKey() ? draft.date : dateKey()} value={date} onChange={(event) => setDate(event.currentTarget.value)} /></label>
    <ItemEditor items={tasks} onChange={setTasks} label="สิ่งที่จะติดตาม" />
    <label>บันทึกสำหรับคุณครู <textarea rows={3} maxLength={600} value={note} onChange={(event) => setNote(event.currentTarget.value)} placeholder="ระบุเฉพาะเรื่องที่จำเป็นสำหรับการติดตาม" /></label>
    <div className="mt-actions">{draft && <button className="mt-button" type="button" onClick={onDone}>ยกเลิกแก้ไข</button>}<button type="submit" className="mt-button mt-button--primary" disabled={!title.trim()}>{draft ? 'บันทึกการแก้ไข' : 'สร้างการติดตามผล'}</button></div>
  </form>
}

function FollowUpCalendar({ followUps, filter, onFilter }: { followUps: FollowUp[]; filter: string; onFilter: (date: string) => void }) {
  const [month, setMonth] = useState(dateKey().slice(0, 7))
  const start = new Date(`${month}-01T12:00:00Z`)
  const offset = start.getUTCDay()
  const year = start.getUTCFullYear()
  const index = start.getUTCMonth()
  const days = new Date(Date.UTC(year, index + 1, 0)).getUTCDate()
  const events = new Set(followUps.map((item) => item.date))
  const monthLabel = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(start)
  const moveMonth = (delta: number) => {
    setMonth(new Date(Date.UTC(year, index + delta, 1, 12)).toISOString().slice(0, 7))
    onFilter('')
  }
  return <>
    <div className="mt-calendar-heading"><button className="mt-button mt-button--icon" type="button" onClick={() => moveMonth(-1)} aria-label="เดือนก่อนหน้า"><ArrowLeft aria-hidden="true" size={16} /></button><strong>{monthLabel}</strong><button className="mt-button mt-button--icon" type="button" onClick={() => moveMonth(1)} aria-label="เดือนถัดไป"><ArrowLeft className="mt-flip" aria-hidden="true" size={16} /></button></div>
    <div className="mt-calendar" aria-label={`ปฏิทินติดตามผล ${monthLabel}`}>
      {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day) => <span className="mt-calendar-week" key={day}>{day}</span>)}
      {Array.from({ length: offset }, (_, position) => <span key={`empty-${position}`} />)}
      {Array.from({ length: days }, (_, position) => {
        const day = position + 1
        const date = `${month}-${String(day).padStart(2, '0')}`
        const hasEvent = events.has(date)
        return <button type="button" className={`mt-calendar-day${hasEvent ? ' has-event' : ''}`} key={date} aria-label={`${dateLabel(date)}${hasEvent ? ' มีรายการติดตามผล' : ''}`} aria-pressed={filter === date} aria-current={date === dateKey() ? 'date' : undefined} onClick={() => onFilter(filter === date ? '' : date)}>{day}</button>
      })}
    </div>
  </>
}

function FollowUpsPanel({ request, initialDate, editable }: { request: SupportRequest; initialDate?: string; editable: boolean }) {
  const { state, actions, toast } = useDemo()
  const [editing, setEditing] = useState<FollowUp>()
  const [filter, setFilter] = useState('')
  const followUps = state.followUps.filter((row) => row.requestId === request.id && row.teacherId === request.teacherId).sort((a, b) => a.date.localeCompare(b.date))
  const filtered = filter ? followUps.filter((row) => row.date === filter) : followUps
  return <div className="mt-columns mt-columns--editor">
    {editable && <ToolSection title={editing ? 'แก้ไขรายการติดตามผล' : 'นัดติดตามผล'} description="นักเรียนจะเห็นวันที่นัดและได้รับการแจ้งเตือนในเดโม"><FollowUpForm key={editing?.id ?? request.id} request={request} draft={editing} initialDate={initialDate} onDone={() => { setEditing(undefined); setFilter('') }} /></ToolSection>}
    <div className="mt-stack">
      <ToolSection title="ปฏิทินติดตามผล"><FollowUpCalendar followUps={followUps} filter={filter} onFilter={setFilter} /></ToolSection>
      <ToolSection title="รายการติดตามผล" description={filter ? dateLabel(filter) : undefined} action={filter && <button type="button" className="mt-button mt-button--small" onClick={() => setFilter('')}>ดูทั้งหมด</button>}>
        {filtered.length ? <div className="mt-row-stack">{filtered.map((row) => <article className="mt-record" key={row.id}>
          <div className="mt-record-heading"><h3>{row.title}</h3><ToolStatus tone={row.completed ? 'mint' : 'yellow'}>{row.completed ? 'ติดตามแล้ว' : 'รอติดตาม'}</ToolStatus></div>
          <p className="mt-muted">{dateLabel(row.date)}</p>
          {row.tasks.length > 0 && <div className="mt-checklist mt-checklist--vertical">{row.tasks.map((item) => <label key={item.id}><input type="checkbox" checked={item.done} disabled={row.completed || !editable} onChange={(event) => actions.saveFollowUp({ ...row, tasks: row.tasks.map((entry) => entry.id === item.id ? { ...item, done: event.currentTarget.checked } : entry) })} />{item.text}</label>)}</div>}
          {row.note && <p className="mt-muted mt-preserve">บันทึกของครู · {row.note}</p>}
          {editable && <div className="mt-actions">
            {!row.completed && <><button type="button" className="mt-button mt-button--small" onClick={() => setEditing(row)}>แก้ไข</button><button type="button" className="mt-button mt-button--small mt-button--primary" onClick={() => { actions.saveFollowUp({ ...row, completed: true }); toast('บันทึกว่าติดตามผลแล้ว') }}>ติดตามแล้ว</button></>}
            <button type="button" className="mt-button mt-button--small mt-button--quiet" onClick={() => { setEditing(undefined); document.getElementById('mt-followup-editor')?.scrollIntoView({ block: 'start' }); document.querySelector<HTMLInputElement>('#mt-followup-editor .mt-form input:not([type])')?.focus() }}>นัดครั้งต่อไป</button>
          </div>}
        </article>)}</div> : <ToolEmpty title={filter ? 'วันนี้ยังไม่มีรายการติดตามผล' : 'ยังไม่มีรายการติดตามผล'} icon={CalendarDays} />}
      </ToolSection>
    </div>
  </div>
}

function ReferralPanel({ request, schedule, editable }: { request: SupportRequest; schedule: (date: string) => void; editable: boolean }) {
  const { state, actions, toast, confirm } = useDemo()
  const [destination, setDestination] = useState(destinations[0])
  const [reason, setReason] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState(false)
  const referrals = state.referrals.filter((entry) => entry.requestId === request.id && entry.teacherId === request.teacherId)
  const student = state.students.find((person) => person.id === request.studentId)
  const plan = state.plans.find((row) => row.requestId === request.id && !row.closed)
  const fieldValues = [student ? `${student.name} · ${student.classroom}` : '', request.preference, plan?.goal ?? 'ยังไม่มีแผนที่กำลังใช้']

  async function submit() {
    if (!await confirm({ title: 'ยืนยันการส่งต่อจำลอง?', message: 'ข้อมูลที่ตรวจแล้วจะถูกบันทึกไว้ในเดโมเท่านั้น ไม่มีการส่งไปยังบุคคลจริง', label: 'ยืนยันการส่งต่อจำลอง' })) return
    actions.saveReferral({ ...recordIdentity(request), destination, reason: reason.trim(), fields: selected, status: 'sent', date: dateKey() })
    setPreview(false)
    setReason('')
    setSelected([])
    toast('บันทึกการส่งต่อจำลองแล้ว')
  }

  return <>
    <ToolNotice icon={ShieldCheck}>การส่งต่อในหน้านี้เป็นการจำลอง ไม่มีข้อมูลถูกส่งไปยังผู้เชี่ยวชาญหรือหน่วยงานจริง</ToolNotice>
    <div className="mt-columns mt-columns--editor">
      {editable && <ToolSection title={preview ? 'ตรวจข้อมูลที่จะส่งต่อ' : 'ส่งต่อจำลอง'} description="เลือกเฉพาะข้อมูลที่จำเป็นต่อการดูแล">
        {preview ? <div className="mt-stack">
          <dl className="mt-data-list"><div><dt>ผู้รับในสถานการณ์สมมติ</dt><dd>{destination}</dd></div>{reason.trim() && <div><dt>เหตุผล</dt><dd>{reason.trim()}</dd></div>}{selected.map((field) => <div key={field}><dt>{field}</dt><dd>{fieldValues[referralFields.indexOf(field)]}</dd></div>)}</dl>
          {selected.length === 0 && <p className="mt-muted">ไม่มีรายการข้อมูลนักเรียนที่เลือกเพิ่ม</p>}
          <div className="mt-actions"><button type="button" className="mt-button" onClick={() => setPreview(false)}>ย้อนกลับ</button><button type="button" className="mt-button mt-button--primary" onClick={() => void submit()}>ยืนยันการส่งต่อจำลอง</button></div>
        </div> : <form className="mt-form" onSubmit={(event) => { event.preventDefault(); setPreview(true) }}>
          <label>ผู้รับการส่งต่อ <select value={destination} onChange={(event) => setDestination(event.currentTarget.value)}>{destinations.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label>เหตุผล (ระบุได้ตามความจำเป็น) <textarea maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.currentTarget.value)} /></label>
          <fieldset className="mt-fieldset"><legend>ข้อมูลประกอบการส่งต่อ</legend><div className="mt-checklist mt-checklist--vertical">{referralFields.map((field) => <label key={field}><input type="checkbox" checked={selected.includes(field)} onChange={(event) => setSelected(event.currentTarget.checked ? [...selected, field] : selected.filter((entry) => entry !== field))} />{field}</label>)}</div></fieldset>
          <div className="mt-actions"><button className="mt-button mt-button--primary" type="submit">ตรวจข้อมูลก่อนยืนยัน</button></div>
        </form>}
      </ToolSection>}
      <ToolSection title="ประวัติการส่งต่อจำลอง">{referrals.length ? <div className="mt-row-stack">{referrals.map((row) => <article className="mt-record mt-form" key={row.id}>
        <div className="mt-record-heading"><h3>{row.destination}</h3><ToolStatus tone={row.status === 'closed' ? 'gray' : 'purple'}>{referralStatuses[row.status]}</ToolStatus></div>
        <small>{dateLabel(row.date)}</small>{row.reason && <p className="mt-preserve">{row.reason}</p>}
        {editable && <><label>สถานะการส่งต่อ <select value={row.status} onChange={(event) => { actions.saveReferral({ ...row, status: event.currentTarget.value as Referral['status'] }); toast('อัปเดตสถานะการส่งต่อแล้ว') }}>{Object.entries(referralStatuses).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
        <div className="mt-actions"><button type="button" className="mt-button mt-button--small" onClick={() => schedule(offsetDate(7))}>นัดติดตามผล</button></div></>}
      </article>)}</div> : <ToolEmpty title="ยังไม่มีรายการส่งต่อ" icon={Send} />}</ToolSection>
    </div>
  </>
}

function CareWorkspace({ initialPanel = 'timeline' }: { initialPanel?: CarePanel }) {
  const { state } = useDemo()
  const [params, setParams] = useSearchParams()
  const [followUpDate, setFollowUpDate] = useState('')
  const requests = requestsFor(state, 'teacher')
  const requestedId = params.get('request') ?? params.get('id')
  const request = requests.find((row) => row.id === requestedId) ?? (!requestedId ? requests.find((row) => row.status !== 'new' && row.status !== 'closed') ?? requests[0] : undefined)
  const currentPanel = params.get('panel')
  const panel = sections.some((section) => section.key === currentPanel) ? currentPanel as CarePanel : initialPanel
  const editable = !!request && request.status !== 'new' && request.status !== 'closed'

  function selectPanel(next: CarePanel) {
    setParams((previous) => { const query = new URLSearchParams(previous); query.set('panel', next); return query })
  }

  const HeadingIcon = sections.find(({ key }) => key === panel)?.icon ?? HeartHandshake
  const heading = panel === 'timeline' ? 'การดูแลอย่างต่อเนื่อง' : sections.find(({ key }) => key === panel)?.label ?? 'การดูแลนักเรียน'

  return <div className="mb-teacher-tools">
    <ToolHeading icon={HeadingIcon} label="Care Loop · การดูแลต่อเนื่อง" title={heading} description="เชื่อมการรับฟังกับแผนช่วยเหลือ การนัดหมาย และการติดตามผลของนักเรียน" />
    <section className="mt-card mt-case-selection">
      <div className="mt-form"><label>เลือกคำขอของนักเรียน <select value={request?.id ?? ''} onChange={(event) => {
        const value = event.currentTarget.value
        setParams((previous) => { const query = new URLSearchParams(previous); query.delete('id'); query.set('request', value); return query })
      }}><option value="" disabled>เลือกคำขอ</option>{requests.map((row) => <option key={row.id} value={row.id}>{state.students.find((student) => student.id === row.studentId)?.name ?? 'นักเรียน'} · {row.topic || row.preference} · {requestStatus[row.status]}</option>)}</select></label></div>
      <div className="mt-tabs" aria-label="มุมมองการดูแล">{sections.map(({ key, label, icon: Icon }) => <button key={key} className="mt-tab" type="button" aria-pressed={panel === key} onClick={() => selectPanel(key)}><Icon size={16} aria-hidden="true" />{label}</button>)}</div>
    </section>
    {!request && <ToolSection title="เลือกคำขอเพื่อเริ่มดูแล"><ToolEmpty title="ยังไม่มีคำขอที่เปิดดูได้" icon={HeartHandshake}><Link to="/teacher/requests">ไปที่คำขอความช่วยเหลือ</Link></ToolEmpty></ToolSection>}
    {request && !editable && panel !== 'timeline' && panel !== 'notes' && <ToolNotice>{request.status === 'new' ? 'รับคำขอจากนักเรียนก่อนเริ่มวางแผน นัดติดตาม หรือส่งต่อ' : 'เปิดคำขออีกครั้งในภาพรวมเมื่อต้องการดูแลต่อ'}</ToolNotice>}
    {request && panel === 'timeline' && <CareTimeline request={request} selectPanel={selectPanel} />}
    {request && panel === 'plan' && <PlansPanel request={request} key={request.id} editable={editable} />}
    {request && panel === 'followup' && <div id="mt-followup-editor"><FollowUpsPanel request={request} key={`${request.id}-${followUpDate}`} initialDate={followUpDate || undefined} editable={editable} /></div>}
    {request && panel === 'notes' && <NotesPanel request={request} key={request.id} />}
    {request && panel === 'referral' && <ReferralPanel request={request} key={request.id} editable={editable} schedule={(date) => { setFollowUpDate(date); selectPanel('followup') }} />}
  </div>
}

export function CareLoop() { return <CareWorkspace /> }
export function SupportPlans() { return <CareWorkspace initialPanel="plan" /> }
export function SupportNotes() { return <CareWorkspace initialPanel="notes" /> }
export function FollowUps() { return <CareWorkspace initialPanel="followup" /> }
export function Referrals() { return <CareWorkspace initialPanel="referral" /> }
