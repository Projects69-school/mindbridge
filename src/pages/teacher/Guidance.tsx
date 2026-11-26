import { useState } from 'react'
import { BookOpen, ChevronDown, ClipboardCheck, Ear, HeartHandshake, Heart, MessageCircleHeart, Shield, Sparkles, UserRound, Waypoints } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import { conversationsFor } from '../../utils/demo'
import { ToolHeading, ToolNotice, ToolSection } from './ToolUI'

const topics = [
  { name: 'การรับฟังอย่างตั้งใจ', english: 'Active Listening', icon: Ear, color: 'purple', description: 'เว้นจังหวะให้นักเรียนเล่าตามที่พร้อม ถามเพื่อทำความเข้าใจ และทวนสิ่งที่ได้ยินให้เขาช่วยยืนยัน', example: 'ขอบคุณที่ไว้ใจเล่าให้ครูฟังนะ ครูขอลองทวนสิ่งที่ได้ยิน เธอช่วยบอกครูได้ไหมว่าตรงกับที่รู้สึกหรือเปล่า?' },
  { name: 'ความเข้าอกเข้าใจ', english: 'Empathy', icon: HeartHandshake, color: 'pink', description: 'ลองฟังจากมุมของนักเรียน ถามว่าส่วนไหนของเหตุการณ์กระทบความรู้สึกของเขามากที่สุด', example: 'ครูอยากเข้าใจจากมุมของเธอ ช่วงไหนของเรื่องนี้ที่รู้สึกว่ายากที่สุด?' },
  { name: 'การยอมรับความรู้สึก', english: 'Emotional Validation', icon: Heart, color: 'yellow', description: 'ตอบรับความรู้สึกที่นักเรียนบอก และให้พื้นที่เขาอธิบายด้วยคำของตัวเอง', example: 'ฟังดูเป็นเรื่องที่ใช้พลังมากเลย ขอบคุณที่บอกครูว่าช่วงนี้เธอรู้สึกอย่างไร' },
  { name: 'การให้ผู้รับความช่วยเหลือเป็นศูนย์กลาง', english: 'Person-Centered Approach', icon: UserRound, color: 'mint', description: 'ถามถึงสิ่งที่นักเรียนต้องการก่อนเสนอทางเลือก แล้วชวนกันตัดสินใจว่าจะเริ่มช่วยจากตรงไหน', example: 'อยากให้ครูช่วยแบบไหน? เราค่อย ๆ เลือกทางที่เธอรู้สึกสบายใจด้วยกันได้' },
  { name: 'การเปิดเผยความรู้สึกตามความสมัครใจ', english: 'Self-Disclosure', icon: MessageCircleHeart, color: 'purple', description: 'ให้นักเรียนเลือกทั้งเรื่องที่จะเล่า จังหวะที่จะหยุด และช่องทางที่สบายใจ', example: 'เล่าเท่าที่พร้อมได้เลยนะ ถ้าอยากพัก เรากลับมาคุยกันเมื่อพร้อมได้' },
  { name: 'ความปลอดภัยทางใจ', english: 'Psychological Safety', icon: Shield, color: 'blue', description: 'อธิบายให้ชัดว่าข้อมูลใดจะอยู่กับครู และกรณีใดที่ต้องแจ้งผู้รับผิดชอบเพื่อดูแลความปลอดภัย', example: 'ก่อนคุยกัน ครูอยากบอกว่าเมื่อมีเรื่องเกี่ยวกับความปลอดภัย ครูอาจต้องขอความช่วยเหลือจากคนที่ดูแลเรื่องนี้ เราจะคุยกันว่าต้องบอกอะไรบ้าง' },
  { name: 'พฤติกรรมการขอความช่วยเหลือ', english: 'Help-Seeking Behavior', icon: Waypoints, color: 'mint', description: 'ช่วยให้การเริ่มต้นง่ายขึ้น เช่น ให้นักเรียนส่งสัญญาณ หรือเลือกเวลาคุยเมื่อรู้สึกพร้อม', example: 'แค่ทักมาบอกว่าอยากให้ครูฟังก็เริ่มได้แล้วนะ ครูพร้อมรับฟัง' },
  { name: 'ขอบเขตการดูแลของครู', english: 'Professional Boundaries', icon: ClipboardCheck, color: 'pink', description: 'บอกช่วงเวลาที่ติดต่อได้และขอบเขตการช่วยเหลือ หากต้องประสานงาน ให้คุยกับนักเรียนถึงข้อมูลที่จำเป็นก่อน', example: 'ครูช่วยรับฟังและหาคนที่เหมาะมาช่วยได้ เรามาคุยกันก่อนว่าจะเริ่มอย่างไรดี' },
]

const helpful = [
  'ขอบคุณที่ไว้ใจเล่าให้ครูฟัง',
  'ครูพร้อมรับฟังนะ',
  'อยากให้ครูช่วยแบบไหน?',
]
const avoid = [
  ['คิดมากไปเอง', 'ชวนเล่าเพิ่มว่าเรื่องนี้กระทบความรู้สึกอย่างไร'],
  ['เรื่องแค่นี้เอง', 'ให้พื้นที่กับความรู้สึกที่นักเรียนบอก'],
  ['คนอื่นลำบากกว่าเธออีก', 'ตั้งใจฟังประสบการณ์ของนักเรียนคนนี้'],
  ['หยุดคิดแบบนั้นสิ', 'ถามว่าตอนนี้อะไรน่าจะช่วยให้สบายใจขึ้นได้บ้าง'],
]
const checklist = [
  'รับฟังโดยไม่ตัดสิน',
  'สะท้อนความรู้สึก',
  'ทำความเข้าใจความต้องการ',
  'ร่วมกันพิจารณาทางเลือก',
  'ตกลงแนวทางช่วยเหลือ',
  'นัดหมายติดตามผล',
]

export function Guidance() {
  const { state } = useDemo()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [checked, setChecked] = useState<string[]>([])
  const conversations = conversationsFor(state, 'teacher').filter((entry) => !entry.archivedBy.includes('teacher') && state.requests.find((request) => request.id === entry.requestId)?.status !== 'closed')
  const requestedConversation = params.get('conversation') || params.get('id')
  const conversation = conversations.find((entry) => entry.id === requestedConversation) ?? conversations[0]

  function chooseConversation(conversationId: string) {
    const query = new URLSearchParams(params)
    query.delete('id')
    query.set('conversation', conversationId)
    setParams(query, { replace: true })
  }

  function copyToChat(draft: string) {
    if (conversation) navigate(`/teacher/messages?id=${encodeURIComponent(conversation.id)}`, { state: { draft } })
  }

  return <div className="mb-teacher-tools">
    <ToolHeading icon={BookOpen} label="คู่มือสำหรับครู" title="รับฟังอย่างเข้าใจ" description="แนวทางและตัวอย่างคำพูดสำหรับเริ่มต้นบทสนทนากับนักเรียน" />
    <section className="mt-guide-banner">
      <div><p className="mt-eyebrow"><Sparkles size={17} aria-hidden="true" /> เริ่มต้นบทสนทนา</p><h2>ให้เวลาเขาค่อย ๆ เล่า</h2><p>เริ่มด้วยคำถามสั้น ๆ หยุดฟัง และถามว่าวันนี้อยากให้ครูอยู่ด้วยแบบไหน</p></div>
      <svg viewBox="0 0 246 132" fill="none" aria-hidden="true" className="mt-guide-illustration">
        <circle cx="143" cy="71" r="59" fill="#EBE1FB" /><circle cx="174" cy="43" r="5" fill="#FAF7FF" />
        <path d="M57 108c-10 3-20 3-31 0m173 0c12 0 19-3 30-6" stroke="#B39CD9" strokeWidth="2" strokeLinecap="round" />
        <rect x="61" y="50" width="93" height="60" rx="21" fill="#BDA8EB" /><path d="M92 102l-14 15v-22" fill="#BDA8EB" />
        <rect x="97" y="23" width="104" height="64" rx="23" fill="#FAF7FF" stroke="#A689D4" strokeWidth="2" /><path d="M173 82l13 14V76" fill="#FAF7FF" stroke="#A689D4" strokeWidth="2" strokeLinejoin="round" />
        <path d="M185 81h-13" stroke="#FAF7FF" strokeWidth="4" /><path d="M149 66c-3-2-17-11-17-19 0-8 12-10 17-3 5-7 17-5 17 3 0 8-14 17-17 19Z" fill="#EDC5DD" stroke="#9679C4" strokeWidth="2" />
        <path d="M61 33v12m-6-6h12m139 14v12m-6-6h12" stroke="#A78CCF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="89" cy="81" r="4" fill="#F9F4FE" /><circle cx="103" cy="81" r="4" fill="#F9F4FE" /><circle cx="117" cy="81" r="4" fill="#F9F4FE" />
      </svg>
    </section>
    {conversations.length > 0 ? <section className="mt-card mt-guidance-recipient">
      <div className="mt-form"><label>บทสนทนาที่จะใช้ตัวอย่างข้อความ <select value={conversation?.id ?? ''} onChange={(event) => chooseConversation(event.currentTarget.value)}>{conversations.map((entry) => {
        const student = state.students.find((person) => person.id === entry.studentId)
        const topic = state.requests.find((request) => request.id === entry.requestId)?.topic
        return <option value={entry.id} key={entry.id}>{[student?.name ?? 'นักเรียน', topic].filter(Boolean).join(' · ')}</option>
      })}</select></label></div>
      <p className="mt-muted">คุณครูแก้ไขข้อความและกดส่งเองได้ในบทสนทนา</p>
    </section> : <ToolNotice>เริ่มใช้ตัวอย่างข้อความได้เมื่อมีบทสนทนาที่เปิดอยู่ในกล่องข้อความ</ToolNotice>}
    <div className="mt-guidance-grid">
      {topics.map(({ name, english, icon: Icon, color, description, example }) => <details className="mt-card mt-guidance-topic" key={name}>
        <summary>
          <span className={`mt-icon mt-icon--${color}`}><Icon size={22} aria-hidden="true" /></span>
          <span className="mt-guidance-title"><strong>{name}</strong><small lang="en">{english}</small></span>
          <ChevronDown className="mt-chevron" size={19} aria-hidden="true" />
        </summary>
        <div className="mt-guidance-content"><p>{description}</p><blockquote>“{example}”</blockquote>{conversation && <button className="mt-button mt-button--quiet" type="button" onClick={() => copyToChat(example)}>ใช้ในข้อความ</button>}</div>
      </details>)}
    </div>
    <div className="mt-columns">
      <ToolSection title="คำพูดที่ช่วยเปิดบทสนทนา">
        <div className="mt-row-stack">{helpful.map((text) => <div className="mt-row" key={text}><p>“{text}”</p>{conversation && <button className="mt-button mt-button--small" type="button" onClick={() => copyToChat(text)}>ใช้ในข้อความ</button>}</div>)}</div>
      </ToolSection>
      <ToolSection title="คำพูดที่ควรเลี่ยง">
        <div className="mt-row-stack">{avoid.map(([example, suggestion]) => <div className="mt-row mt-row--column" key={example}><strong>“{example}”</strong><small>{suggestion}</small></div>)}</div>
      </ToolSection>
    </div>
    <ToolSection title="รายการทบทวนบทสนทนา" description="ใช้ทบทวนหลังพูดคุยกับนักเรียน">
      <div className="mt-checklist">{checklist.map((item) => <label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={(event) => setChecked(event.currentTarget.checked ? [...checked, item] : checked.filter((value) => value !== item))} />{item}</label>)}</div>
      <progress className="mt-progress" max={checklist.length} value={checked.length} aria-label="รายการทบทวนที่เลือกแล้ว" />
      <p className="mt-muted" aria-live="polite">ทบทวนแล้ว {checked.length} จาก {checklist.length} ข้อ</p>
    </ToolSection>
    <ToolNotice>คู่มือนี้ใช้ประกอบการเรียนรู้และฝึกการสื่อสาร การดูแลผู้เรียนควรเป็นไปตามขอบเขตหน้าที่และแนวทางของโรงเรียน</ToolNotice>
  </div>
}
