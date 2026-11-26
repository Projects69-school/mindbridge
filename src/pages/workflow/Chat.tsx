import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Archive, BookOpen, CalendarDays, Check, CheckCheck, ChevronDown, Clock, Flag, HandHeart, ImagePlus, MessageCircle, Paperclip, Search, Send, Settings, Smile, UsersRound } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { Conversation, DemoState, Message, Role, SharedDraft } from '../../types/demo'
import { STUDENT_ID, conversationsFor, id, now, sharedFor } from '../../utils/demo'
import { RequestPill, SharedContent } from './Records'
import { Avatar, Empty, Hint, Modal, PageHead, dateTimeLabel, supportiveReplies, timeLabel, toDataUrl } from './ui'

const emojis = ['💜', '🌷', '🌿', '✨', '🤍', '😊', '🙏', '🌈']
const fileTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const maxImageSize = 4_000_000
const details = {
  student: { heading: 'ข้อความ', participant: 'คุณครู', placeholder: 'พิมพ์ข้อความถึงคุณครู…', report: 'รายงานพฤติกรรมที่ทำให้ไม่สบายใจ' },
  teacher: { heading: 'ข้อความ', participant: 'นักเรียน', placeholder: 'เขียนข้อความถึงนักเรียน…', report: 'บันทึกข้อกังวลด้านความปลอดภัย' },
}

const partner = (state: DemoState, conversation: Conversation, role: Role) =>
  role === 'student' ? state.teachers.find((person) => person.id === conversation.teacherId) : state.students.find((person) => person.id === conversation.studentId)
const messageOrder = (first: Message, second: Message) => Date.parse(first.createdAt) - Date.parse(second.createdAt)

export function Chat({ role }: { role: Role }) {
  const { state } = useDemo()
  const location = useLocation()
  const [params] = useSearchParams()
  const [listQuery, setListQuery] = useState('')
  const [viewArchived, setViewArchived] = useState(false)
  const [mobileList, setMobileList] = useState(false)
  const chosenId = params.get('id') || params.get('conversation')
  const conversations = conversationsFor(state, role)
  const domainMessages = state.messages.filter((message) => conversations.some((row) => row.id === message.conversationId))
  const messagesFor = (conversationId: string) => domainMessages.filter((message) => message.conversationId === conversationId).sort(messageOrder)
  const lastDate = (conversation: Conversation) => messagesFor(conversation.id).at(-1)?.createdAt || conversation.createdAt
  const rows = conversations.sort((a, b) => Date.parse(lastDate(b)) - Date.parse(lastDate(a)))
  const visible = rows.filter((row) => viewArchived === row.archivedBy.includes(role) && partner(state, row, role)?.name.toLowerCase().includes(listQuery.trim().toLowerCase()))
  const selected = rows.find((row) => row.id === chosenId) || visible[0]
  const chosenDraft = (location.state as { draft?: string } | null)?.draft || ''

  return <div className="wf wf-chat-page">
    <PageHead title={details[role].heading} description={role === 'teacher' ? 'รับฟังและตอบกลับนักเรียนในบทสนทนาที่เกี่ยวข้องกับการดูแล' : 'คุยกับคุณครูที่เธอไว้วางใจ และเลือกได้ว่าอยากเล่าแค่ไหน'} icon={MessageCircle}
      actions={role === 'teacher' ? <Link className="wf-button" to={selected ? '/teacher/guidance?conversation=' + selected.id : '/teacher/guidance'}><BookOpen size={17} /> คู่มือการรับฟัง</Link> : undefined} />
    <div className="wf-chat">
      {selected && <button type="button" className="wf-text-button wf-chat-switch" aria-controls="wf-conversation-list" aria-expanded={mobileList} onClick={() => setMobileList(!mobileList)}>
        <UsersRound size={16} aria-hidden="true" /> เลือกบทสนทนา <ChevronDown size={15} aria-hidden="true" />
      </button>}
      <aside className="wf-chat-list" id="wf-conversation-list" data-mobile-open={mobileList || !selected}>
        <h2>บทสนทนา</h2>
        <label className="wf-field"><span className="wf-sr-only">ค้นหาชื่อ{details[role].participant}</span><div className="wf-search"><Search size={16} aria-hidden="true" /><input type="search" placeholder={'ค้นหาชื่อ' + details[role].participant} value={listQuery} onChange={(event) => setListQuery(event.target.value)} /></div></label>
        <div className="wf-tabs" aria-label="ประเภทของบทสนทนา">
          <button type="button" className="wf-tab" aria-pressed={!viewArchived} onClick={() => setViewArchived(false)}>กล่องข้อความ</button>
          <button type="button" className="wf-tab" aria-pressed={viewArchived} onClick={() => setViewArchived(true)}>เก็บไว้</button>
        </div>
        {visible.length ? <div className="wf-chat-nav">{visible.map((row, index) => {
          const user = partner(state, row, role)
          const messages = messagesFor(row.id)
          const last = messages.at(-1)
          const unread = messages.filter((message) => message.sender !== role && !message.read).length
          return <Link key={row.id} className="wf-row wf-chat-entry" aria-current={selected?.id === row.id ? 'page' : undefined} to={`/${role}/messages?id=${row.id}`} onClick={() => setMobileList(false)}>
            <div className="wf-row-main"><Avatar name={user?.name || details[role].participant} avatar={user?.avatar} skin={index} />
              <div><strong>{user?.name}</strong><small>{last?.text || (last?.sharedIds.length ? 'มีสิ่งที่แบ่งปัน' : 'เริ่มพูดคุยได้เลย')}</small></div>
            </div>{unread > 0 && <span className="wf-unread" aria-label={unread + ' ข้อความที่ยังไม่ได้อ่าน'}>{unread}</span>}
          </Link>
        })}</div> : <p className="wf-subtle">{listQuery ? 'ไม่พบบทสนทนาตามที่ค้นหา' : viewArchived ? 'ยังไม่มีบทสนทนาที่เก็บไว้' : 'ยังไม่มีบทสนทนาในกล่องข้อความ'}</p>}
      </aside>
      {selected ? <ChatThread key={selected.id + location.key} conversation={selected} messages={messagesFor(selected.id)} role={role} initialDraft={chosenDraft} /> :
        <div className="wf-chat-placeholder"><Empty title="ยังไม่มีบทสนทนาให้เปิด" text={role === 'teacher' ? 'เมื่อคุณครูรับคำขอแล้ว บทสนทนาจะปรากฏที่นี่' : 'เมื่อคุณครูรับคำขอแล้ว เธอจะเริ่มคุยกับคุณครูได้ที่นี่'} action={<Link className="wf-button" to={role === 'student' ? '/student/support' : '/teacher/requests'}>{role === 'student' ? 'ขอความช่วยเหลือ' : 'เปิดรายการคำขอ'}</Link>} /></div>}
    </div>
    <Hint>ข้อความจะส่งระหว่างบทบาทในแท็บสาธิตนี้เท่านั้น สำหรับความช่วยเหลือเร่งด่วน ให้ติดต่อผู้ใหญ่ที่ไว้ใจได้หรือบริการฉุกเฉินโดยตรง</Hint>
  </div>
}

function ChatThread({ conversation, messages, role, initialDraft }: { conversation: Conversation; messages: Message[]; role: Role; initialDraft: string }) {
  const { state, actions, toast } = useDemo()
  const [message, setMessage] = useState(initialDraft)
  const [query, setQuery] = useState('')
  const [panel, setPanel] = useState<'emoji' | 'responses' | 'sharing' | 'report' | null>(null)
  const [attachments, setAttachments] = useState<SharedDraft[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')
  const log = useRef<HTMLDivElement>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const user = partner(state, conversation, role)
  const request = state.requests.find((row) => row.id === conversation.requestId && row.studentId === conversation.studentId && row.teacherId === conversation.teacherId)
  const unread = messages.filter((item) => item.sender !== role && !item.read).length
  const allowedAttachments = sharedFor(state, conversation.teacherId, conversation.studentId)
  const findAttachments = (item: Message) => allowedAttachments.filter((entry) => item.sharedIds.includes(entry.id))
  const visible = messages.filter((item) => [item.text, ...findAttachments(item).map((entry) => entry.label + ' ' + (entry.text || ''))].some((value) => value.toLowerCase().includes(query.toLowerCase().trim())))
  const archived = conversation.archivedBy.includes(role)
  const closed = (request?.status === 'closed' || request?.status === 'new')
  const requestQuery = conversation.requestId ? '&request=' + conversation.requestId : ''
  const partyQuery = role === 'student' ? '&teacher=' + conversation.teacherId : '&student=' + conversation.studentId
  const { markMessages } = actions

  useEffect(() => {
    if (unread) markMessages(conversation.id, role)
  }, [conversation.id, markMessages, role, unread])
  useEffect(() => {
    if (log.current && visible.length) log.current.scrollTop = log.current.scrollHeight
  }, [visible.length])

  function archive() {
    actions.update('conversations', (rows) => rows.map((row) => row.id === conversation.id ? {
      ...row, archivedBy: archived ? row.archivedBy.filter((item) => item !== role) : [...row.archivedBy, role],
    } : row))
    toast(archived ? 'นำบทสนทนากลับมาแล้ว' : 'เก็บบทสนทนาไว้แล้ว')
  }

  async function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!fileTypes.includes(file.type) || file.size > maxImageSize) {
      setError('เลือกภาพ PNG, JPG, WebP หรือ GIF ขนาดไม่เกิน 4 เมกะไบต์')
      return
    }
    setBusy(true)
    try {
      const src = await toDataUrl(file)
      setAttachments((current) => [...current, { kind: 'image', label: 'ภาพประกอบข้อความ', src }])
      setError('')
    } catch {
      setError('เปิดภาพนี้ไม่สำเร็จ ลองเลือกภาพอื่น')
    } finally {
      setBusy(false)
    }
  }

  function send(event: FormEvent) {
    event.preventDefault()
    if (closed || busy || (!message.trim() && !attachments.length)) return
    if (actions.sendMessage(conversation.id, role, message.trim(), [], attachments)) {
      setMessage('')
      setAttachments([])
      setPanel(null)
      setError('')
      editor.current?.focus()
    } else setError('ส่งข้อความไม่สำเร็จ ลองเปิดบทสนทนาอีกครั้ง')
  }

  function report(event: FormEvent) {
    event.preventDefault()
    if (!reason.trim()) return
    actions.update('concerns', (rows) => [...rows, { id: id(), conversationId: conversation.id, role, reason: reason.trim(), createdAt: now() }])
    setReason('')
    setPanel(null)
    toast('บันทึกข้อกังวลในสาธิตแล้ว')
  }

  return <section className="wf-chat-thread" aria-label={'บทสนทนากับ ' + user?.name}>
    <header className="wf-chat-top">
      <div className="wf-person"><Avatar name={user?.name || details[role].participant} avatar={user?.avatar} /><div><h2>{user?.name}</h2>
        <small>{role === 'student' ? state.teachers.find((row) => row.id === conversation.teacherId)?.title : state.students.find((row) => row.id === conversation.studentId)?.classroom}</small></div></div>
      <details className="wf-chat-menu">
        <summary className="wf-button">ตัวเลือก</summary>
        <div className="wf-stack">
          <button className="wf-text-button" type="button" onClick={archive}><Archive size={16} /> {archived ? 'นำกลับมาแสดง' : 'เก็บบทสนทนา'}</button>
          <button className="wf-text-button" type="button" onClick={() => setPanel('report')}><Flag size={16} /> {details[role].report}</button>
          {role === 'student' && <Link className="wf-text-button" to="/student/teachers"><UsersRound size={16} /> เลือกคุณครูคนอื่น</Link>}
          <Link className="wf-text-button" to={`/${role}/settings?tab=notifications`}><Settings size={16} /> การแจ้งเตือน</Link>
        </div>
      </details>
    </header>
    <div className="wf-chat-context">
      {request && <><Link className="wf-back" to={role === 'teacher' ? '/teacher/requests?id=' + request.id : '/student/journey?id=' + request.id}>ดูคำขอ</Link><RequestPill status={request.status} /></>}
      {!closed && <Link className="wf-text-button" to={`/${role}/appointments?new=1` + requestQuery + partyQuery}><CalendarDays size={17} /> นัดหมาย</Link>}
      {role === 'teacher' && request && !closed && <Link className="wf-text-button" to={`/teacher/care?panel=followup` + requestQuery}><Clock size={16} /> ติดตามผล</Link>}
    </div>
    <label className="wf-field wf-chat-search"><span className="wf-sr-only">ค้นหาในข้อความ</span><div className="wf-search"><Search size={17} aria-hidden="true" /><input type="search" placeholder="ค้นหาในข้อความ" value={query} onChange={(event) => setQuery(event.target.value)} /></div></label>
    <div className="wf-chat-log" role="log" aria-label="ประวัติข้อความ" ref={log}>
      {visible.length > 0 ? visible.map((item) => <div key={item.id} className={'wf-bubble-row' + (item.sender === role ? ' wf-own' : '')}>
        <article className="wf-bubble">
          {item.text && <p>{item.text}</p>}
          {findAttachments(item).map((shared) => <SharedContent item={shared} key={shared.id} />)}
          {!item.text && !findAttachments(item).length && <small>รายการแบ่งปันนี้ไม่สามารถเปิดได้</small>}
          <small className="wf-bubble-meta"><time dateTime={item.createdAt} title={dateTimeLabel(item.createdAt)}>{timeLabel(item.createdAt)} น.</time>
            {item.sender === role && (item.read ? <CheckCheck size={15} aria-label="อ่านแล้ว" /> : <Check size={15} aria-label="ส่งแล้ว" />)}</small>
        </article>
      </div>) : <Empty title={query ? 'ไม่พบข้อความที่ค้นหา' : 'เริ่มคุยได้ตามความพร้อม'} text={query ? 'ลองเปลี่ยนคำค้นหา' : 'คำทักทายสั้น ๆ ก็เป็นจุดเริ่มต้นที่ดี'} />}
    </div>
    {closed ? <div className="wf-chat-composer"><Hint>{request?.status === 'closed' ? 'เปิดคำขออีกครั้งเพื่อคุยต่อในบทสนทนานี้' : 'จะเริ่มส่งข้อความได้หลังจากคุณครูรับคำขอ'}</Hint></div> :
      <form className="wf-chat-composer" onSubmit={send}>
        {attachments.length > 0 && <div className="wf-attachment-box wf-chat-preview">
          <strong>ตรวจสิ่งที่จะแบ่งปันกับ {user?.name}</strong>{attachments.map((item, index) => <div key={index} className="wf-row">
            <SharedContent item={{ ...item, id: '', studentId: conversation.studentId, teacherId: conversation.teacherId, createdAt: '' }} />
            <button className="wf-text-button" type="button" onClick={() => setAttachments(attachments.filter((_, entry) => entry !== index))}>นำออก</button></div>)}
        </div>}
        {panel === 'emoji' && <div className="wf-actions" aria-label="อีโมจิ">{emojis.map((emoji, index) => <button className="wf-icon-button" key={emoji} type="button" aria-label={['หัวใจสีม่วง', 'ดอกทิวลิป', 'ใบไม้', 'ประกาย', 'หัวใจสีขาว', 'ยิ้ม', 'ขอบคุณ', 'สายรุ้ง'][index]} onClick={() => { setMessage((current) => (current + emoji).slice(0, 2000)); editor.current?.focus() }}>{emoji}</button>)}</div>}
        {panel === 'responses' && <div className="wf-stack" aria-label="ถ้อยคำแนะนำ">
          <strong>เลือกข้อความ แล้วปรับเป็นภาษาของคุณครูได้</strong>
          <div className="wf-actions">{supportiveReplies.map((text) => <button key={text} type="button" className="wf-button" onClick={() => { setMessage(text); setPanel(null); editor.current?.focus() }}>{text}</button>)}</div>
          <Link className="wf-back" to={'/teacher/guidance?conversation=' + conversation.id}>เปิดคู่มือสำหรับครู</Link>
        </div>}
        <div className="wf-compose-row">
          <label className="wf-field"><span className="wf-sr-only">พิมพ์ข้อความ</span><textarea rows={1} ref={editor} value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} placeholder={details[role].placeholder} onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) event.currentTarget.form?.requestSubmit()
          }} /></label>
          <button type="submit" className="wf-button wf-primary" disabled={busy || (!message.trim() && !attachments.length)}><Send size={17} /> ส่งข้อความ</button>
        </div>
        {error && <p className="wf-error" role="alert">{error}</p>}
        <div className="wf-actions wf-compose-tools">
          <button className="wf-text-button" type="button" aria-expanded={panel === 'emoji'} onClick={() => setPanel(panel === 'emoji' ? null : 'emoji')}><Smile size={17} /> อีโมจิ</button>
          <button className="wf-text-button" type="button" onClick={() => fileInput.current?.click()}><ImagePlus size={17} /> แนบภาพ</button>
          <input className="wf-sr-only" ref={fileInput} aria-label="เลือกภาพที่จะแนบ" type="file" accept={fileTypes.join(',')} tabIndex={-1} onChange={pickImage} />
          {role === 'student' ? <button className="wf-text-button" type="button" onClick={() => setPanel('sharing')}><Paperclip size={17} /> เลือกสิ่งที่จะแบ่งปัน</button> :
            <button className="wf-text-button" type="button" aria-expanded={panel === 'responses'} onClick={() => setPanel(panel === 'responses' ? null : 'responses')}><HandHeart size={17} /> ถ้อยคำแนะนำ</button>}
        </div>
      </form>}
    {panel === 'sharing' && <AttachmentPicker onDismiss={() => setPanel(null)} onAdd={(item) => { setAttachments([...attachments, item]); setPanel(null) }} />}
    {panel === 'report' && <Modal title={details[role].report} onDismiss={() => setPanel(null)}><form className="wf-stack" onSubmit={report}>
      <Hint>บันทึกจะอยู่ในแท็บนี้เพื่อทดลองขั้นตอนการรายงาน</Hint>
      <label className="wf-field">สิ่งที่อยากแจ้ง<textarea maxLength={650} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="ระบุข้อมูลสมมติที่จำเป็น" required /></label>
      <button className="wf-button wf-primary" type="submit" disabled={!reason.trim()}>บันทึกรายงานในสาธิต</button>
    </form></Modal>}
  </section>
}

function AttachmentPicker({ onAdd, onDismiss }: { onAdd: (item: SharedDraft) => void; onDismiss: () => void }) {
  const { state } = useDemo()
  const [kind, setKind] = useState<'emotion' | 'journal' | 'drawing' | 'voice'>('emotion')
  const [source, setSource] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const checkIns = state.checkIns.filter((row) => row.studentId === STUDENT_ID)
  const journals = state.journals.filter((row) => row.studentId === STUDENT_ID)
  const drawings = state.drawings.filter((row) => row.studentId === STUDENT_ID)
  const voices = state.voices.filter((row) => row.studentId === STUDENT_ID)
  const journal = journals.find((row) => row.id === source)
  const drawing = drawings.find((row) => row.id === source)
  const label = { emotion: 'อารมณ์ที่เลือกแบ่งปัน', journal: 'ข้อความจากบันทึกที่เลือก', drawing: 'ภาพวาดที่เลือกแบ่งปัน', voice: 'เสียงที่เลือกแบ่งปัน' }[kind]

  async function add(event: FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (kind === 'emotion' && value) onAdd({ kind, label, text: value, sourceId: source || undefined })
    if (kind === 'journal' && journal && value) {
      if (journal.body.includes(value)) onAdd({ kind, label, sourceId: source, text: value })
      else setError('เลือกข้อความบางส่วนที่มีอยู่ในบันทึกนี้')
    }
    if (kind === 'drawing' && drawing) onAdd({ kind, label, src: drawing.src, sourceId: source })
    if (kind === 'voice') {
      const voice = voices.find((row) => row.id === source)
      if (!voice) return
      setBusy(true)
      try {
        const src = voice.blob ? await toDataUrl(new File([voice.blob], 'เสียงชั่วคราว', { type: voice.blob.type })) : import.meta.env.BASE_URL + 'assets/voice-example.wav'
        onAdd({ kind, label: voice.simulated ? 'เสียงตัวอย่างจำลอง' : label, src, sourceId: source })
      } catch {
        setError('เปิดไฟล์เสียงเพื่อแสดงตัวอย่างไม่สำเร็จ')
      } finally {
        setBusy(false)
      }
    }
  }

  return <Modal title="เลือกสิ่งที่จะแบ่งปัน" onDismiss={onDismiss}><form className="wf-stack" onSubmit={add}>
    <label className="wf-field">ประเภทข้อมูล<select value={kind} onChange={(event) => { setKind(event.target.value as typeof kind); setSource(''); setText(''); setError('') }}>
      <option value="emotion">อารมณ์</option><option value="journal">ข้อความจากบันทึกส่วนตัว</option><option value="drawing">ภาพวาด</option><option value="voice">บันทึกเสียง</option>
    </select></label>
    {kind === 'emotion' && <>
      <label className="wf-field">เลือกอารมณ์จากเช็กอิน (ข้ามได้)<select value={source + '\u001f' + text} onChange={(event) => { const [nextId, emotion] = event.target.value.split('\u001f'); setSource(nextId); setText(emotion) }}>
        <option value={'\u001f' + text}>ระบุด้วยตัวเอง</option>{checkIns.flatMap((row) => row.emotions.map((emotion) => <option key={row.id + emotion} value={row.id + '\u001f' + emotion}>{emotion} · {row.date}</option>))}
      </select></label>
      <label className="wf-field">ชื่ออารมณ์ที่จะแบ่งปัน<input maxLength={100} value={text} onChange={(event) => { setText(event.target.value); setSource('') }} placeholder="เช่น กังวล" /></label>
    </>}
    {kind === 'journal' && <>
      <label className="wf-field">เลือกบันทึก<select value={source} onChange={(event) => { setSource(event.target.value); setText('') }}><option value="">เลือกบันทึก</option>{journals.map((row) => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label>
      {journal && <><details><summary>เปิดบันทึกเพื่อเลือกข้อความ</summary><p className="wf-preserve">{journal.body}</p></details><label className="wf-field">คัดลอกเฉพาะส่วนที่อยากส่ง<textarea value={text} maxLength={800} onChange={(event) => setText(event.target.value)} /></label></>}
    </>}
    {kind === 'drawing' && <>
      <label className="wf-field">เลือกภาพวาด<select value={source} onChange={(event) => setSource(event.target.value)}><option value="">เลือกภาพวาด</option>{drawings.map((row) => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label>
      {drawing && <img className="wf-image" src={drawing.src} alt="ภาพที่จะส่งให้คุณครู" />}
    </>}
    {kind === 'voice' && <label className="wf-field">เลือกบันทึกเสียง<select value={source} onChange={(event) => setSource(event.target.value)}><option value="">เลือกบันทึกเสียง</option>{voices.map((row) => <option key={row.id} value={row.id}>{row.title}{row.simulated ? ' · ตัวอย่างจำลอง' : ''}</option>)}</select></label>}
    {error && <p className="wf-error" role="alert">{error}</p>}
    <button className="wf-button wf-primary" type="submit" disabled={busy || (kind === 'emotion' ? !text.trim() : !source || (kind === 'journal' && !text.trim()))}>แนบไว้ตรวจสอบก่อนส่ง</button>
  </form></Modal>
}
