import { useState, type FormEvent } from 'react'
import { BookOpen, CalendarDays, Check, ClipboardCheck, ClipboardList, Clock, LifeBuoy, LockKeyhole, MessageCircle, Search, Send, UserRound } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { DemoState, Feedback, RequestStatus, SharedItem, SupportRequest } from '../../types/demo'
import { appointmentStatus, requestStatus, requestsFor, sharedFor } from '../../utils/demo'
import { Avatar, Back, Empty, Hint, Modal, PageHead, Review, Status, bkkDay, dateLabel, dateTimeLabel, supportChoices, topics } from './ui'

const requestTones: Record<RequestStatus, string> = {
  new: 'amber', accepted: 'green', talking: '', planned: '', followup: 'green', referred: 'pink', closed: 'gray',
}
const referralLabels = { draft: 'ฉบับร่าง', sent: 'ส่งต่อในสาธิตแล้ว', review: 'กำลังพิจารณา', closed: 'เสร็จสิ้นการส่งต่อ' }
const feedbackQuestions = [
  ['heard', 'รู้สึกว่าได้รับการรับฟังหรือไม่?'],
  ['useful', 'การพูดคุยครั้งนี้เป็นประโยชน์กับเธอไหม?'],
  ['more', 'ยังต้องการความช่วยเหลือเพิ่มเติมหรือไม่?'],
  ['again', 'อยากนัดพูดคุยอีกครั้งไหม?'],
]

export function RequestPill({ status }: { status: RequestStatus }) {
  return <Status tone={requestTones[status]}>{requestStatus[status]}</Status>
}

export function SharedContent({ item }: { item: SharedItem }) {
  return <div className="wf-shared-content">
    <strong>{item.label}</strong>
    {item.text && <p className="wf-preserve">{item.text}</p>}
    {item.src && item.kind === 'voice' && <audio controls className="wf-audio" src={item.src} aria-label={item.label} />}
    {item.src && (item.kind === 'image' || item.kind === 'drawing') && <img className="wf-image" src={item.src} alt={item.label} />}
  </div>
}

export function FeedbackDetails({ feedback }: { feedback: Feedback }) {
  return <div className="wf-card wf-feedback">
    <div className="wf-group-head"><h3>ความคิดเห็นที่นักเรียนเลือกส่ง</h3><small>{dateTimeLabel(feedback.createdAt)}</small></div>
    <Review items={feedbackQuestions.filter(([key]) => feedback.answers[key]).map(([key, label]) => [label, feedback.answers[key]])} />
    {feedback.text && <p className="wf-preserve">{feedback.text}</p>}
  </div>
}

function RequestHistory({ request }: { request: SupportRequest }) {
  const events = [...request.events].sort((first, second) => Date.parse(first.date) - Date.parse(second.date))
  return <section className="wf-card">
    <div className="wf-person"><span className="wf-choice-icon"><Clock size={18} aria-hidden="true" /></span><h2>ความคืบหน้า</h2></div>
    {events.length > 0 ? <ol className="wf-timeline">{events.map((event) => <li key={event.id}>
      <span><Check size={14} aria-hidden="true" /></span><div><strong>{event.title}</strong>{event.detail && <p>{event.detail}</p>}<small>{dateTimeLabel(event.date)}</small></div>
    </li>)}</ol> : <p>ส่งคำขอแล้ว · {dateTimeLabel(request.createdAt)}</p>}
  </section>
}

function SharedRequest({ state, request }: { state: DemoState; request: SupportRequest }) {
  const shared = sharedFor(state, request.teacherId, request.studentId).filter((item) => request.sharedIds.includes(item.id))
  return <section className="wf-card">
    <div><h2>ข้อมูลที่เลือกแบ่งปัน</h2><p>รายละเอียดที่ถูกส่งมาพร้อมคำขอนี้</p></div>
    <Review items={[
      ['ความช่วยเหลือที่ต้องการ', request.preference], ['ช่องทางที่สะดวก', request.method], ['หัวข้อ', request.topic],
      ['อารมณ์ที่แบ่งปัน', request.emotions.join(' · ')], ['ข้อความ', request.message],
    ]} />
    {shared.map((item) => <SharedContent item={item} key={item.id} />)}
  </section>
}

export function TeacherRequests() {
  const { state } = useDemo()
  const [params] = useSearchParams()
  const requests = requestsFor(state, 'teacher')
  const selected = requests.find((request) => request.id === (params.get('id') || params.get('request')))
  return selected ? <TeacherRequestDetail key={selected.id} request={selected} /> : <TeacherRequestList requests={requests} />
}

function TeacherRequestList({ requests }: { requests: SupportRequest[] }) {
  const { state } = useDemo()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [preference, setPreference] = useState('')
  const [topic, setTopic] = useState('')
  const [day, setDay] = useState('')
  const [sort, setSort] = useState('latest')
  const statusChoices = Object.entries(requestStatus)
  const knownTopics = [...new Set([...topics, ...requests.map((record) => record.topic).filter(Boolean)])]
  const rows = requests.filter((record) => {
    const student = state.students.find((entry) => entry.id === record.studentId)
    const match = [student?.name, student?.classroom, record.preference, record.topic].some((value) => value?.toLowerCase().includes(query.trim().toLowerCase()))
    return match && (!status || status === record.status) && (!preference || preference === record.preference) &&
      (!topic || topic === record.topic) && (!day || day === bkkDay(record.createdAt))
  }).sort((a, b) => sort === 'latest' ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : Date.parse(a.createdAt) - Date.parse(b.createdAt))

  return <div className="wf">
    <PageHead title="คำขอความช่วยเหลือ" description="ดูข้อมูลที่นักเรียนเลือกแบ่งปันและเริ่มช่วยเหลือตามความพร้อมของนักเรียน" icon={ClipboardList} />
    <section className="wf-card">
      <div className="wf-grid wf-grid-three">
        <label className="wf-field"><span>ค้นหาคำขอ</span><div className="wf-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ชื่อ ห้องเรียน หรือหัวข้อ" /></div></label>
        <label className="wf-field">สถานะ<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">ทุกสถานะ</option>{statusChoices.map(([value, label]) => <option key={value} value={value}>{value === 'new' ? 'คำขอใหม่' : label}</option>)}</select></label>
        <label className="wf-field">ความช่วยเหลือที่ต้องการ<select value={preference} onChange={(event) => setPreference(event.target.value)}><option value="">ทุกประเภท</option>{supportChoices.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="wf-field">หัวข้อ<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">ทุกหัวข้อ</option>{knownTopics.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="wf-field">วันที่ส่งคำขอ<input type="date" lang="th" value={day} onChange={(event) => setDay(event.target.value)} /></label>
        <label className="wf-field">เรียงตาม<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">ส่งล่าสุด</option><option value="waiting">รอนานที่สุด</option></select></label>
      </div>
    </section>
    <section className="wf-card">
      <div className="wf-group-head"><h2>รายการคำขอ</h2><Status>{rows.length} รายการ</Status></div>
      {rows.length ? <div className="wf-row-list">{rows.map((record, index) => {
        const student = state.students.find((entry) => entry.id === record.studentId)
        return <Link key={record.id} className="wf-row" to={'/teacher/requests?id=' + record.id}>
          <div className="wf-row-main"><Avatar name={student?.name || 'นักเรียน'} avatar={student?.avatar} skin={index} />
            <div><strong>{student?.name} · {record.preference}</strong><small>{[student?.classroom, record.topic, dateTimeLabel(record.createdAt)].filter(Boolean).join(' · ')}</small></div>
          </div><RequestPill status={record.status} />
        </Link>
      })}</div> : <Empty title="ไม่พบคำขอ" text={requests.length ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 'คำขอใหม่ที่ส่งถึงคุณครูจะปรากฏที่นี่'} icon={ClipboardCheck} />}
    </section>
  </div>
}

function TeacherRequestDetail({ request }: { request: SupportRequest }) {
  const { state, actions, toast, confirm } = useDemo()
  const student = state.students.find((row) => row.id === request.studentId)
  const feedback = state.feedback.filter((entry) => entry.requestId === request.id && entry.teacherId === state.teacherId)
  const careHref = '/teacher/care?request=' + request.id
  async function close() {
    if (await confirm({ title: 'สิ้นสุดการดูแล', message: 'ปิดคำขอนี้ในสาธิตใช่ไหม? สามารถเปิดคำขออีกครั้งได้', label: 'สิ้นสุดการดูแล' })) {
      if (actions.setRequestStatus(request.id, 'closed')) toast('สิ้นสุดการดูแลในสาธิตแล้ว')
    }
  }
  function accept() {
    if (actions.setRequestStatus(request.id, 'accepted')) toast('รับคำขอแล้ว นักเรียนจะเห็นการอัปเดตในสาธิต')
  }

  return <div className="wf">
    <Back to="/teacher/requests">คำขอทั้งหมด</Back>
    <PageHead title={request.preference} description={[student?.name, student?.grade, dateTimeLabel(request.createdAt)].filter(Boolean).join(' · ')} icon={ClipboardList} actions={<RequestPill status={request.status} />} />
    <div className="wf-split">
      <SharedRequest state={state} request={request} />
      <aside className="wf-card wf-request-actions">
        <h2>ดำเนินการต่อ</h2>
        {request.status === 'new' && <button type="button" className="wf-button wf-primary" onClick={accept}><Check size={17} /> รับคำขอนี้</button>}
        {request.conversationId && request.status !== 'new' && <Link className="wf-button wf-primary" to={'/teacher/messages?id=' + request.conversationId}><MessageCircle size={17} /> ตอบข้อความนักเรียน</Link>}
        <Link className="wf-button" to={'/teacher/students?student=' + request.studentId}><UserRound size={17} /> ดูประวัติการดูแล</Link>
        {request.status !== 'closed' && <>
          <Link className="wf-button" to={'/teacher/appointments?new=1&request=' + request.id}><CalendarDays size={17} /> สร้างนัดหมาย</Link>
          <Link className="wf-button" to={careHref + '&panel=plan'}><ClipboardList size={17} /> สร้างแผนการดูแล</Link>
          <Link className="wf-button" to={careHref + '&panel=followup'}><Clock size={17} /> นัดติดตามผล</Link>
          <Link className="wf-button" to={careHref + '&panel=referral'}><LifeBuoy size={17} /> บันทึกการส่งต่อสมมติ</Link>
        </>}
        {request.status === 'closed' ? <button className="wf-button" type="button" onClick={() => { if (actions.setRequestStatus(request.id, request.conversationId ? 'accepted' : 'new')) toast('เปิดคำขออีกครั้งแล้ว') }}>เปิดคำขออีกครั้ง</button>
          : <button type="button" className="wf-button wf-danger" onClick={close}>สิ้นสุดการดูแล</button>}
      </aside>
    </div>
    <RequestHistory request={request} />
    {feedback.map((entry) => <FeedbackDetails key={entry.id} feedback={entry} />)}
    <Hint><LockKeyhole size={15} className="wf-inline-icon" /> ครูเห็นเฉพาะข้อมูลที่นักเรียนเลือกส่ง และรายการที่เกี่ยวข้องกับการดูแลในสาธิตนี้</Hint>
  </div>
}

function FeedbackForm({ request, followUpId, onDismiss }: { request: SupportRequest; followUpId?: string; onDismiss: () => void }) {
  const { actions, toast } = useDemo()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [text, setText] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    if (actions.submitFeedback(request.id, answers, text.trim(), followUpId)) {
      toast('ส่งความคิดเห็นในสาธิตแล้ว')
      onDismiss()
    }
  }

  return <Modal title="สะท้อนการดูแล" onDismiss={onDismiss}>
    <form className="wf-stack" onSubmit={submit}>
      <p className="wf-subtle">เลือกตอบเฉพาะข้อที่อยากบอกคุณครู</p>
      {feedbackQuestions.map(([key, label]) => <label key={key} className="wf-field">{label}
        <select value={answers[key] || ''} onChange={(event) => setAnswers({ ...answers, [key]: event.target.value })}>
          <option value="">ข้ามข้อนี้</option><option>ใช่</option><option>ไม่</option><option>ยังไม่แน่ใจ</option>
        </select></label>)}
      <label className="wf-field">อยากบอกอะไรเพิ่มเติมไหม?<textarea rows={2} maxLength={700} placeholder="เพิ่มความคิดเห็นได้ตามความสมัครใจ" value={text} onChange={(event) => setText(event.target.value)} /></label>
      <div className="wf-actions"><button className="wf-button wf-primary" disabled={!Object.values(answers).some(Boolean) && !text.trim()}><Send size={17} /> ส่งความคิดเห็น</button><button className="wf-button wf-quiet" type="button" onClick={onDismiss}>ข้าม</button></div>
    </form>
  </Modal>
}

export function Journey() {
  const { state } = useDemo()
  const [params] = useSearchParams()
  const rows = requestsFor(state, 'student').sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
  const selected = rows.find((row) => row.id === params.get('id'))
  if (selected) return <JourneyDetail request={selected} key={selected.id} />
  return <div className="wf">
    <PageHead title="เส้นทางการดูแล" description="ดูความคืบหน้าทีละขั้น ตั้งแต่ส่งคำขอไปจนถึงการติดตามผล" icon={ClipboardList} actions={<Link className="wf-button wf-primary" to="/student/support">ขอความช่วยเหลือเพิ่มเติม</Link>} />
    <section className="wf-card">
      <h2>คำขอของฉัน</h2>
      {rows.length ? <div className="wf-row-list">{rows.map((row, index) => {
        const teacher = state.teachers.find((entry) => entry.id === row.teacherId)
        return <Link key={row.id} className="wf-row" to={'/student/journey?id=' + row.id}>
          <div className="wf-row-main"><Avatar name={teacher?.name || 'ครู'} avatar={teacher?.avatar} skin={index} />
            <div><strong>{row.preference}</strong><small>{teacher?.name} · {dateTimeLabel(row.createdAt)}</small></div></div><RequestPill status={row.status} />
        </Link>
      })}</div> : <Empty title="ยังไม่มีคำขอความช่วยเหลือ" text="เมื่อเธอส่งคำขอ จะเห็นอัปเดตจากคุณครูที่นี่" icon={ClipboardList} />}
    </section>
    <Link className="wf-back" to="/student/teachers">ทำความรู้จักคุณครูคนอื่น</Link>
  </div>
}

function JourneyDetail({ request }: { request: SupportRequest }) {
  const { state, actions, toast } = useDemo()
  const [feedbackOn, setFeedbackOn] = useState<string | null>(null)
  const teacher = state.teachers.find((row) => row.id === request.teacherId)
  const appointments = state.appointments.filter((row) => row.studentId === request.studentId && row.requestId === request.id)
  const plans = state.plans.filter((row) => row.studentId === request.studentId && row.requestId === request.id)
  const notes = state.notes.filter((row) => row.studentId === request.studentId && row.requestId === request.id && row.visibility === 'student')
  const followUps = state.followUps.filter((row) => row.studentId === request.studentId && row.requestId === request.id)
  const referrals = state.referrals.filter((row) => row.studentId === request.studentId && row.requestId === request.id && row.status !== 'draft')
  const sentFeedback = state.feedback.filter((row) => row.studentId === request.studentId && row.requestId === request.id)

  return <div className="wf">
    <Back to="/student/journey">คำขอทั้งหมด</Back>
    <PageHead title={request.preference} description={(teacher?.name || 'คุณครู') + ' · ส่งเมื่อ ' + dateTimeLabel(request.createdAt)} icon={ClipboardList} actions={<RequestPill status={request.status} />} />
    <div className="wf-actions">
      {request.conversationId && request.status !== 'new' && <Link className="wf-button wf-primary" to={'/student/messages?id=' + request.conversationId}><MessageCircle size={17} /> เปิดข้อความ</Link>}
      <Link className="wf-button" to={'/student/appointments?new=1&request=' + request.id + '&teacher=' + request.teacherId}><CalendarDays size={17} /> ดูหรือนัดหมาย</Link>
      <Link className="wf-button" to="/student/teachers">ขอความช่วยเหลือจากครูคนอื่น</Link>
      {request.status === 'closed' && <button className="wf-button" type="button" onClick={() => { if (actions.setRequestStatus(request.id, request.conversationId ? 'accepted' : 'new')) toast('เปิดคำขอนี้อีกครั้งแล้ว') }}>เปิดคำขอนี้อีกครั้ง</button>}
    </div>
    <div className="wf-split wf-split-even"><RequestHistory request={request} /><SharedRequest state={state} request={request} /></div>
    {(appointments.length > 0 || followUps.length > 0) && <section className="wf-card"><h2>นัดหมายและการติดตามผล</h2><div className="wf-row-list">
      {appointments.map((row) => <Link className="wf-row" to={'/student/appointments?id=' + row.id} key={row.id}><span><strong>{row.type}</strong><br /><small>{dateLabel(row.date)} · {row.time} น.</small></span><Status>{appointmentStatus[row.status]}</Status></Link>)}
      {followUps.map((row) => <div className="wf-row" key={row.id}>
        <div className="wf-stack"><strong>{row.title}</strong><small>{dateLabel(row.date)} · {row.completed ? 'ติดตามผลแล้ว' : 'รอติดตามผล'}</small>
          {row.tasks.map((task) => <span key={task.id}>{task.done ? '✓ ' : '• '}{task.text}</span>)}
        </div>
        {!sentFeedback.some((entry) => entry.followUpId === row.id) && <button className="wf-button" type="button" onClick={() => setFeedbackOn(row.id)}>ให้ความคิดเห็น</button>}
      </div>)}
    </div></section>}
    {plans.length > 0 && <section className="wf-card"><h2>แผนการดูแลร่วมกัน</h2>{plans.map((plan) => <div className="wf-shared-content" key={plan.id}>
      <div className="wf-group-head"><strong>{plan.goal}</strong><Status tone={plan.closed ? 'gray' : 'green'}>{plan.closed ? 'สิ้นสุดแผนแล้ว' : 'กำลังดำเนินการ'}</Status></div>
      {plan.actions.length > 0 && <p>{plan.actions.join(' · ')}</p>}
      {plan.date && <small>ติดตามผล {dateLabel(plan.date)}</small>}
      {plan.items.map((item) => <p key={item.id}>{item.done ? '✓ ' : '• '}{item.text}</p>)}
    </div>)}</section>}
    {notes.length > 0 && <section className="wf-card"><h2>บันทึกที่คุณครูแบ่งปัน</h2>{notes.map((note) => <div className="wf-shared-content" key={note.id}><p className="wf-preserve">{note.text}</p><small>{dateTimeLabel(note.createdAt)}</small></div>)}</section>}
    {referrals.length > 0 && <section className="wf-card"><h2>การส่งต่อในสาธิต</h2>{referrals.map((row) => <div className="wf-row" key={row.id}><strong>{row.destination}</strong><Status>{referralLabels[row.status]}</Status></div>)}</section>}
    {request.status !== 'new' && <section className="wf-card">
      <div className="wf-person"><span className="wf-choice-icon"><BookOpen size={18} aria-hidden="true" /></span><div><h2>อยากสะท้อนการดูแลไหม?</h2><p>ความคิดเห็นของเธอช่วยให้คุณครูเข้าใจว่าควรช่วยต่ออย่างไร</p></div></div>
      {sentFeedback.filter((entry) => !entry.followUpId).map((entry) => <FeedbackDetails key={entry.id} feedback={entry} />)}
      {!sentFeedback.some((entry) => !entry.followUpId) && <div className="wf-actions"><button className="wf-button" type="button" onClick={() => setFeedbackOn('request')}>ให้ความคิดเห็น</button></div>}
    </section>}
    {feedbackOn && <FeedbackForm request={request} followUpId={feedbackOn === 'request' ? undefined : feedbackOn} onDismiss={() => setFeedbackOn(null)} />}
  </div>
}
