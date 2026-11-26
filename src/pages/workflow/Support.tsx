import { useRef, useState } from 'react'
import { CalendarDays, Check, CircleHelp, HandHeart, HeartHandshake, Lightbulb, LockKeyhole, MessageCircle, Search, Send, UsersRound } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { SharedDraft, Teacher, TeacherAvailability } from '../../types/demo'
import { STUDENT_ID } from '../../utils/demo'
import { Avatar, Empty, Hint, PageHead, Review, Status, Success, contactMethods, supportChoices, topics } from './ui'

const labels = ['ความช่วยเหลือ', 'เลือกคุณครู', 'วิธีพูดคุย', 'รายละเอียด', 'ตรวจและส่ง']
const preferenceIcons = [HeartHandshake, Lightbulb, HandHeart, CalendarDays, UsersRound, CircleHelp]
const emotions = ['มีความสุข', 'สบายใจ', 'ตื่นเต้น', 'เฉย ๆ', 'เหนื่อย', 'สับสน', 'เครียด', 'กังวล', 'โกรธ', 'เหงา', 'เศร้า', 'รู้สึกหนักใจ', 'ยังไม่แน่ใจ']
const confidentiality = 'ในสถานการณ์จริง หากมีความจำเป็นด้านความปลอดภัย ครูอาจส่งต่อข้อมูลเท่าที่จำเป็นให้ผู้รับผิดชอบตามแนวทางของโรงเรียน'

function TeacherInfo({ teacher, availability, index }: {
  teacher: Teacher; availability?: TeacherAvailability; index: number
}) {
  return <>
    <div className="wf-person">
      <Avatar name={teacher.name} avatar={teacher.avatar} skin={index} />
      <div><strong>{teacher.name}</strong><small>{teacher.title}</small></div>
    </div>
    <p>{teacher.intro}</p>
    <small>การอบรมในสถานการณ์สมมติ · {teacher.training}</small>
    <small>ช่องทางที่สะดวก · {teacher.methods.join(' · ') || 'คุยกับครูเพื่อเลือกช่องทาง'}</small>
    {teacher.appointmentPreference && <small>{teacher.appointmentPreference}</small>}
    <div className="wf-actions"><Status tone={availability?.available ? 'green' : 'gray'}>{availability?.available ? 'พร้อมรับคำขอ' : 'พักรับนัดหมาย'}</Status>
      {availability?.responseTime && <small>{availability.responseTime}</small>}</div>
  </>
}

export function TeacherDirectory() {
  const { state } = useDemo()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const choices = [...new Set(state.teachers.map((teacher) => teacher.title))]
  const teachers = state.teachers.filter((teacher) =>
    teacher.name.includes(query.trim()) && (!filter || teacher.title === filter) &&
    (!onlyAvailable || state.availability.some((entry) => entry.teacherId === teacher.id && entry.available)))

  return <div className="wf">
    <PageHead title="เลือกครูที่ไว้วางใจ" description="ทำความรู้จักคุณครูในสถานการณ์สมมติ แล้วเลือกคนที่เธอรู้สึกสบายใจที่จะเริ่มคุยด้วย" icon={UsersRound} />
    <section className="wf-card">
      <div className="wf-grid">
        <label className="wf-field"><span>ค้นหาคุณครู</span><div className="wf-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="พิมพ์ชื่อคุณครู" /></div></label>
        <label className="wf-field">บทบาทของคุณครู<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">ทุกบทบาท</option>{choices.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
      </div>
      <label className="wf-check"><input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} /> แสดงเฉพาะครูที่พร้อมรับคำขอ</label>
    </section>
    {teachers.length ? <div className="wf-grid wf-grid-three">
      {teachers.map((teacher, index) => <article key={teacher.id} className="wf-card wf-teacher-tile">
        <TeacherInfo teacher={teacher} index={index} availability={state.availability.find((entry) => entry.teacherId === teacher.id)} />
        <Link className="wf-button" to={'/student/support?teacher=' + encodeURIComponent(teacher.id)}>เลือก {teacher.name}</Link>
      </article>)}
    </div> : <section className="wf-card"><Empty title="ไม่พบคุณครูตามที่ค้นหา" text="ลองใช้ชื่อสั้น ๆ หรือเปลี่ยนตัวกรอง" icon={Search} /></section>}
    <Hint>การเลือกคุณครูในสาธิตจะเปิดการรับส่งข้อความภายในเว็บนี้ตามบทบาทที่เลือก ใช้ปุ่มสลับบัญชีเพื่อลองรับคำขอในมุมคุณครู</Hint>
  </div>
}

export function Support() {
  const [params] = useSearchParams()
  return <SupportWizard key={params.toString()} params={params} />
}

function SupportWizard({ params }: { params: URLSearchParams }) {
  const { state, actions } = useDemo()
  const [step, setStep] = useState(0)
  const [preference, setPreference] = useState('')
  const [teacherId, setTeacherId] = useState(params.get('teacher') || '')
  const [method, setMethod] = useState(params.get('mode') === 'express' ? contactMethods[0] : contactMethods[3])
  const providedEmotions = (params.get('emotion') || '').split(',').map((value) => value.trim()).filter(Boolean)
  const [selectedEmotions, setSelectedEmotions] = useState(providedEmotions)
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [journalId, setJournalId] = useState(params.get('journal') || '')
  const [excerpt, setExcerpt] = useState('')
  const [drawingId, setDrawingId] = useState(params.get('drawing') || '')
  const [requestId, setRequestId] = useState('')
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const teacher = state.teachers.find((row) => row.id === teacherId)
  const journals = state.journals.filter((row) => row.studentId === STUDENT_ID)
  const drawings = state.drawings.filter((row) => row.studentId === STUDENT_ID)
  const journal = journals.find((row) => row.id === journalId)
  const drawing = drawings.find((row) => row.id === drawingId)
  const drawingPreview = drawing && <img className="wf-image" src={drawing.src} alt="ภาพที่เลือกส่งให้คุณครู" />
  const mode = params.get('mode')
  const changeStep = (next: number) => {
    setStep(next)
    setError('')
    requestAnimationFrame(() => heading.current?.focus())
  }

  function skipDetails() {
    setSelectedEmotions([])
    setTopic('')
    setMessage('')
    setJournalId('')
    setExcerpt('')
    setDrawingId('')
    changeStep(4)
  }

  function nextStep() {
    if (step === 3 && excerpt.trim() && !journal?.body.includes(excerpt.trim())) {
      setError('กรุณาคัดลอกข้อความบางส่วนจากบันทึกที่เลือก')
      return
    }
    changeStep(step + 1)
  }

  function submit() {
    if (!teacher || !preference || !method) return
    const shared: SharedDraft[] = []
    if (journal && excerpt.trim()) shared.push({ kind: 'journal', sourceId: journal.id, label: 'ข้อความที่เลือกจากบันทึกส่วนตัว', text: excerpt.trim() })
    if (drawing) shared.push({ kind: 'drawing', sourceId: drawing.id, label: 'ภาพวาดที่เลือก', src: drawing.src })
    setRequestId(actions.submitRequest({ teacherId, preference, method, topic, message: message.trim(), emotions: selectedEmotions, shared }))
  }

  if (requestId) return <div className="wf">
    <PageHead title="ขอความช่วยเหลือ" icon={HeartHandshake} />
    <Success title="ส่งคำขอในสาธิตแล้ว" actions={<><Link className="wf-button wf-primary" to={'/student/journey?id=' + requestId}>ดูเส้นทางการดูแล</Link><Link className="wf-button" to="/student/dashboard">กลับหน้าหลัก</Link></>}>
      {teacher?.name} จะเห็นคำขอนี้เมื่อเข้าสู่โหมดคุณครู เธอติดตามความคืบหน้าได้ที่เส้นทางการดูแล
    </Success>
  </div>

  return <div className="wf">
    <PageHead title="ขอความช่วยเหลือ" description={mode === 'signal' ? 'ส่งสัญญาณให้ครูรู้ว่าเธออยากได้ความช่วยเหลือ ข้ามรายละเอียดได้เลย' : 'เลือกสิ่งที่ต้องการ แล้วตัดสินใจเองว่าจะส่งข้อมูลอะไรให้ครู'} icon={HeartHandshake}
      actions={<Link className="wf-button" to="/student/teachers"><UsersRound size={17} /> ดูรายชื่อคุณครู</Link>} />
    <section className="wf-card wf-wizard" aria-label="ขั้นตอนการขอความช่วยเหลือ">
      <ol className="wf-steps">{labels.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} data-complete={step > index}>
        <span>{step > index ? <Check size={16} aria-label="เสร็จแล้ว" /> : index + 1}</span><b>{label}</b>
      </li>)}</ol>
      {step === 0 && <div className="wf-stack">
        <div><h2 ref={heading} tabIndex={-1}>ตอนนี้อยากให้ครูช่วยแบบไหน?</h2><p>เลือกข้อที่ตรงใจที่สุด เธอเลือกว่ายังไม่แน่ใจได้</p></div>
        <fieldset className="wf-choice-grid"><legend className="wf-sr-only">ความช่วยเหลือที่ต้องการ</legend>
          {supportChoices.map((choice, index) => {
            const Icon = preferenceIcons[index]
            return <label className="wf-choice" key={choice}><input type="radio" name="preference" checked={preference === choice} onChange={() => setPreference(choice)} />
              <span className={'wf-choice-icon wf-tone-' + index % 3}><Icon size={19} aria-hidden="true" /></span><strong>{choice}</strong>
            </label>
          })}
        </fieldset>
      </div>}
      {step === 1 && <div className="wf-stack">
        <div><h2 ref={heading} tabIndex={-1}>อยากเริ่มคุยกับครูคนไหน?</h2><p>เธอเลือกคุณครูที่รู้สึกสบายใจได้</p></div>
        <fieldset className="wf-choice-grid wf-teacher-choices"><legend className="wf-sr-only">เลือกคุณครู</legend>
          {state.teachers.map((row, index) => <label className="wf-choice wf-teacher-tile" key={row.id}>
            <input type="radio" name="teacher" checked={teacherId === row.id} onChange={() => setTeacherId(row.id)} aria-label={row.name} />
            <TeacherInfo teacher={row} index={index} availability={state.availability.find((entry) => entry.teacherId === row.id)} />
          </label>)}
        </fieldset>
      </div>}
      {step === 2 && <div className="wf-stack">
        <div><h2 ref={heading} tabIndex={-1}>เธอสะดวกเริ่มคุยทางไหน?</h2><p>เลือกวิธีที่ตรงกับความพร้อมตอนนี้</p></div>
        <fieldset className="wf-choice-grid"><legend className="wf-sr-only">ช่องทางการพูดคุย</legend>
          {contactMethods.map((choice, index) => <label className="wf-choice" key={choice}><input type="radio" name="method" checked={method === choice} onChange={() => setMethod(choice)} />
            <span className={'wf-choice-icon wf-tone-' + index % 3}><MessageCircle size={18} aria-hidden="true" /></span><strong>{choice}</strong>
          </label>)}
        </fieldset>
      </div>}
      {step === 3 && <div className="wf-stack">
        <div><h2 ref={heading} tabIndex={-1}>มีอะไรที่อยากให้ครูรู้เพิ่มไหม?</h2><p>ข้ามส่วนนี้ได้ทุกข้อ</p></div>
        <fieldset className="wf-emotion-field"><legend>อารมณ์ที่อยากแบ่งปัน</legend><div>
          {[...new Set([...emotions, ...providedEmotions])].map((emotion) => <label key={emotion} className="wf-emotion"><input type="checkbox" checked={selectedEmotions.includes(emotion)} onChange={(event) => setSelectedEmotions(event.target.checked ? [...selectedEmotions, emotion] : selectedEmotions.filter((value) => value !== emotion))} />{emotion}</label>)}
        </div></fieldset>
        <label className="wf-field">หัวข้อที่อยากบอก<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">ยังไม่ระบุ</option>{topics.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="wf-field">ข้อความถึงคุณครู<textarea maxLength={800} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="เขียนเท่าที่เธอสบายใจ" /></label>
        {journals.length > 0 && <div className="wf-stack wf-attachment-box">
          <label className="wf-field">ข้อความบางส่วนจากบันทึกส่วนตัว<select value={journalId} onChange={(event) => { setJournalId(event.target.value); setExcerpt('') }}><option value="">ไม่แนบข้อความจากบันทึก</option>{journals.map((row) => <option value={row.id} key={row.id}>{row.title}</option>)}</select></label>
          {journal && <><details><summary>อ่านบันทึกเพื่อเลือกข้อความ</summary><p className="wf-preserve">{journal.body}</p></details>
            <label className="wf-field">คัดลอกเฉพาะส่วนที่จะส่งให้ครู<textarea value={excerpt} maxLength={800} onChange={(event) => setExcerpt(event.target.value)} placeholder="วางข้อความบางส่วนที่นี่" /></label></>}
        </div>}
        {drawings.length > 0 && <label className="wf-field">ภาพวาดที่จะแนบ<select value={drawingId} onChange={(event) => setDrawingId(event.target.value)}><option value="">ไม่แนบภาพวาด</option>{drawings.map((row) => <option value={row.id} key={row.id}>{row.title}</option>)}</select></label>}
        {drawingPreview}
      </div>}
      {step === 4 && <div className="wf-stack">
        <div><h2 ref={heading} tabIndex={-1}>ตรวจสอบข้อมูลก่อนส่ง</h2><p>คุณครูจะเห็นเฉพาะข้อมูลที่แสดงในหน้านี้</p></div>
        <Review items={[
          ['ผู้รับ', teacher?.name], ['วัตถุประสงค์', preference], ['วิธีที่สะดวก', method], ['หัวข้อ', topic],
          ['อารมณ์', selectedEmotions.join(' · ')], ['ข้อความ', message.trim()], ['ข้อความจากบันทึก', excerpt.trim()], ['ภาพวาด', drawingPreview],
        ]} />
        <Hint>{confidentiality}</Hint>
      </div>}
      {error && <p className="wf-error" role="alert">{error}</p>}
      <div className="wf-wizard-actions">
        <button className="wf-button wf-quiet" type="button" onClick={() => changeStep(step - 1)} disabled={step === 0}>ย้อนกลับ</button>
        <div className="wf-actions">
          {step === 2 && <button className="wf-button" type="button" onClick={skipDetails}>ข้ามรายละเอียด</button>}
          {step < 4 ? <button className="wf-button wf-primary" type="button" disabled={step === 0 ? !preference : step === 1 ? !teacher : !method} onClick={nextStep}>{step === 3 ? 'ตรวจสอบก่อนส่ง' : 'ถัดไป'}</button>
            : <button className="wf-button wf-primary" type="button" onClick={submit}><Send size={17} /> ส่งคำขอในสาธิต</button>}
        </div>
      </div>
    </section>
    <Hint><LockKeyhole className="wf-inline-icon" size={15} aria-hidden="true" /> ข้อมูลที่เธอกรอกอยู่ในแท็บนี้จนกว่าจะรีเฟรช การส่งคำขอเกิดขึ้นภายในสาธิต</Hint>
  </div>
}
