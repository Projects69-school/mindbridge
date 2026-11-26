import { createContext, useContext, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleCheck, Play, RotateCcw, Shuffle, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDemo } from '../context/DemoContext'
import { createSeed } from '../data/mockData'
import { PublicShell } from '../pages/Public'
import { STUDENT_ID, TEACHER_ID } from '../utils/demo'
import '../styles/guide.css'

interface GuideValue {
  index: number
  requestId?: string
  conversationId?: string
  appointmentId?: string
  start: (reset?: boolean) => void
  open: (index: number) => void
  end: () => void
}
const GuideContext = createContext<GuideValue | null>(null)

const steps = [
  { title:'เข้าพื้นที่นักเรียน', route:'/student/dashboard', text:'เริ่มจากหน้าหลักของฟ้า พื้นที่นี้รวมการเช็กอิน ขอความช่วยเหลือ และดูความคืบหน้า' },
  { title:'เลือกเครียดและกังวล', route:'/student/emotions?emotion=เครียด&emotion=กังวล', text:'ตรวจว่าเลือก “เครียด” และ “กังวล” แล้วบันทึกการเช็กอินไว้เป็นส่วนตัว' },
  { title:'สำรวจวงล้ออารมณ์', route:'/student/emotion-decoder', text:'ลองเลือกกลุ่มความกลัวและสำรวจคำว่า “กังวล”' },
  { title:'เปิดสะพานใจ', route:'/student/trust-ladder', text:'ดูทางเลือกทั้งห้ารูปแบบ นักเรียนกลับมาหรือข้ามไปทางอื่นได้ทุกเมื่อ' },
  { title:'เลือก SIGNAL', route:'/student/trust-ladder', text:'เลือก “SIGNAL” เพื่อดูวิธีส่งสัญญาณโดยไม่ต้องเล่ารายละเอียด' },
  { title:'เลือกแบบที่อยากให้ช่วย', route:'/student/support?mode=signal', text:'เลือก “อยากให้มีคนรับฟัง” แล้วกด “ถัดไป”' },
  { title:'เลือกครูพลอย', route:'/student/support?mode=signal', text:'เลือกครูพลอย แล้วกด “ถัดไป” ระบบเปิดข้อมูลครูสมมติให้พิจารณา' },
  { title:'ตรวจข้อมูลก่อนส่ง', route:'/student/support?mode=signal', text:'กด “ข้ามรายละเอียด” แล้วดูว่าครูพลอยจะได้รับอะไร' },
  { title:'ส่งคำขอความช่วยเหลือ', route:'/student/support?mode=signal', text:'กด “ส่งคำขอในสาธิต” เมื่อพร้อม คำขอจะเข้ากล่องงานของครูพลอยในแท็บนี้' },
  { title:'สลับเป็นคุณครู', route:'/teacher/dashboard', text:'ดูจำนวนคำขอใหม่บนภาพรวมของครูพลอย' },
  { title:'เปิดคำขอที่เพิ่งเข้ามา', route:'/teacher/requests?id={request}', text:'ตรวจคำขอของฟ้า ครูจะเห็นเฉพาะข้อมูลที่ฟ้าเลือกส่ง' },
  { title:'รับเรื่องของฟ้า', route:'/teacher/requests?id={request}', text:'กด “รับคำขอนี้” เพื่อเปิดบทสนทนาและส่งการแจ้งเตือนให้ฟ้า' },
  { title:'เปิดคู่มือสำหรับครู', route:'/teacher/guidance?conversation={chat}', text:'เปิดหัวข้อการรับฟังอย่างตั้งใจหรือดูตัวอย่างท้ายหน้า' },
  { title:'เลือกและปรับข้อความตอบกลับ', route:'/teacher/guidance?conversation={chat}', text:'เลือก “ใช้ในข้อความ” แล้วปรับประโยคให้เป็นคำของตัวเองในช่องเขียนข้อความ' },
  { title:'ส่งข้อความตอบกลับ', route:'/teacher/messages?id={chat}', text:'กดส่งข้อความด้วยตัวเอง แล้วข้อความจะปรากฏในกล่องข้อความของฟ้า' },
  { title:'กลับไปที่พื้นที่นักเรียน', route:'/student/dashboard', text:'สังเกตข้อความล่าสุดและสถานะการดูแลที่อัปเดต' },
  { title:'อ่านข้อความจากครู', route:'/student/messages?id={chat}', text:'เปิดบทสนทนาของฟ้าและดูข้อความที่ครูส่งเมื่อสักครู่' },
  { title:'ขอนัดหมาย', route:'/student/appointments?new=1&request={request}', text:'เลือกวันที่และช่วงเวลาว่าง แล้วกด “ส่งคำขอนัดหมาย”' },
  { title:'ครูยืนยันนัดหมาย', route:'/teacher/appointments?id={appointment}', text:'ตรวจวันและเวลาที่ฟ้าเลือก แล้วกด “ยืนยันนัดหมาย”' },
  { title:'สร้างการติดตามผล', route:'/teacher/care?request={request}&panel=followup', text:'กรอกหัวข้อและวันที่ แล้วกด “สร้างการติดตามผล” เพื่อให้นักเรียนเห็นกำหนดการ' },
  { title:'ดูเส้นทางการดูแลที่อัปเดต', route:'/student/journey?id={request}', text:'ดูข้อความ นัดหมาย และการติดตามผลที่เกิดจากสิ่งที่เพิ่งทำในแอป' },
]

export function GuideProvider({ children }: PropsWithChildren) {
  const { state, actions, confirm } = useDemo()
  const [index, setIndex] = useState(-1)
  const [originalIds, setOriginalIds] = useState<string[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const request = state.requests.find(row => row.studentId === STUDENT_ID && row.teacherId === TEACHER_ID && !originalIds.includes(row.id))
  const appointment = state.appointments.find(row => request && row.requestId === request.id)
  async function start(reset = false) {
    if (reset) {
      const result = await confirm({ title:'เริ่มการสาธิตใหม่?', message:'ระบบจะคืนข้อมูลสมมติชุดแรกและพากลับไปขั้นตอนแรก', label:'เริ่มใหม่' })
      if (!result) return
      actions.reset()
    }
    const baseline = reset ? createSeed().requests : state.requests
    setOriginalIds(baseline.map(row => row.id))
    actions.setTeacher(TEACHER_ID)
    setIndex(0)
    navigate('/student/dashboard')
  }
  function open(next: number) {
    if (next < 0) return
    if (next >= steps.length) { setIndex(steps.length); navigate('/demo'); return }
    setIndex(next)
    const template = steps[next].route
    let href = template.replace('{request}', request?.id ?? '').replace('{chat}', request?.conversationId ?? '').replace('{appointment}', appointment?.id ?? '')
    if (href.endsWith('=')) href = href.split('?')[0]
    const inComposer = next === 14 && location.pathname === '/teacher/messages'
    if (!inComposer && `${location.pathname}${location.search}` !== href) navigate(href)
  }
  function end() { setIndex(steps.length); navigate('/demo') }
  return <GuideContext.Provider value={{ index, start, open, end, requestId: request?.id, conversationId: request?.conversationId, appointmentId: appointment?.id }}>{children}</GuideContext.Provider>
}
function useGuide() { return useContext(GuideContext)! }

export function GuidedDemo() {
  const guide = useGuide()
  const completed = guide.index === steps.length
  return <PublicShell><div className="public-wrap guided-intro">
    <section className="innovation-hero">
      <div className="hero-label">{completed ? <CircleCheck size={17} /> : <Sparkles size={17} />} สาธิตสำหรับกรรมการ</div>
      <h1>{completed ? 'จบการสาธิต' : 'เดินข้ามสะพานใจไปกับฟ้า'}</h1>
      <p>{completed ? 'กลับไปดูคำขอที่สร้างไว้ หรือเริ่มใหม่ด้วยชุดข้อมูลสมมติชุดแรก' : 'ลองทั้งบทบาทนักเรียนและครูผ่านสถานการณ์เดียว ตั้งแต่ฟ้าลองส่งสัญญาณไปจนถึงครูนัดติดตามผล ใช้เวลาประมาณ 3 นาที'}</p>
      <div className="button-row">
        {completed ? <button className="btn btn-primary" onClick={() => guide.start(true)}><RotateCcw size={17} /> เริ่มใหม่</button>
          : <button className="btn btn-primary" onClick={() => guide.index >= 0 ? guide.open(guide.index) : guide.start()}><Play size={17} />{guide.index >= 0 ? 'กลับไปขั้นตอนล่าสุด' : 'เริ่มการสาธิต'}</button>}
        {completed && guide.requestId && <Link className="btn btn-secondary" to={`/student/journey?id=${guide.requestId}`}>ดูเส้นทางการดูแล</Link>}
        {!completed && <Link className="btn btn-secondary" to="/select-role">เลือกบทบาทเอง</Link>}
      </div>
    </section>
    <div className="guided-scenes">
      <article className="panel"><h2>สำรวจความรู้สึก</h2><p>เช็กอิน ใช้วงล้ออารมณ์ แล้วเลือกความพร้อมบน Trust Ladder</p></article>
      <article className="panel"><h2>ส่งสัญญาณและรับฟัง</h2><p>ส่งคำขอถึงครูพลอย สลับบทบาท รับเรื่อง และตอบข้อความ</p></article>
      <article className="panel"><h2>ดูแลต่อเนื่อง</h2><p>ขอนัด ยืนยันเวลา แล้วกำหนดการติดตามผลร่วมกัน</p></article>
    </div>
  </div></PublicShell>
}

export function GuideDock() {
  const { index, requestId, conversationId, appointmentId, open, end, start } = useGuide()
  const { state } = useDemo()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  if (index < 0 || index >= steps.length || (!pathname.startsWith('/student/') && !pathname.startsWith('/teacher/'))) return null
  const step = steps[index]
  const eligibility = [
    { step:8, done:!!requestId, text:'ส่งคำขอในหน้าสาธิตเพื่อไปต่อ' },
    { step:11, done:!!conversationId, text:'รับคำขอก่อนเปิดบทสนทนา' },
    { step:14, done:state.messages.some(row => row.conversationId === conversationId && row.sender === 'teacher'), text:'ส่งข้อความตอบกลับเพื่อไปต่อ' },
    { step:17, done:!!appointmentId, text:'ส่งคำขอนัดหมายเพื่อไปต่อ' },
    { step:18, done:state.appointments.some(row => row.id === appointmentId && row.status === 'confirmed'), text:'ยืนยันนัดหมายเพื่อไปต่อ' },
    { step:19, done:state.followUps.some(row => row.requestId === requestId), text:'บันทึกการติดตามผลเพื่อไปต่อ' },
  ].find(item => item.step === index)
  return <aside className={`demo-guide-dock ${collapsed ? 'collapsed' : ''}`} aria-label="คู่มือสาธิตสำหรับกรรมการ">
    <button className="guide-top" type="button" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><Sparkles size={17} /><span>การสาธิต · {index + 1}/{steps.length}</span>{collapsed ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
    {!collapsed && <div className="guide-content">
      <progress value={index + 1} max={steps.length} aria-label="ความคืบหน้าการสาธิต" />
      <div aria-live="polite"><strong>{step.title}</strong><p>{step.text}</p></div>
      {eligibility && !eligibility.done && <small className="muted">{eligibility.text}</small>}
      <div className="guide-controls"><button className="btn btn-secondary" onClick={() => open(index - 1)} disabled={index === 0}><ChevronLeft size={14} /> ย้อนกลับ</button>
        <button className="btn btn-primary" onClick={() => open(index + 1)} disabled={eligibility?.done === false}>{index === steps.length - 1 ? 'จบการสาธิต' : 'ขั้นตอนถัดไป'} <ChevronRight size={14} /></button></div>
      <div className="guide-actions"><button onClick={() => navigate(pathname.startsWith('/teacher/') ? '/student/dashboard' : '/teacher/dashboard')}><Shuffle size={13} /> สลับบทบาท</button><button onClick={() => start(true)}>เริ่มใหม่</button>{index < steps.length - 1 && <button onClick={end}>จบการสาธิต</button>}</div>
    </div>}
  </aside>
}
