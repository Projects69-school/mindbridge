import { useEffect, useRef, type ReactNode } from 'react'
import { Check, ChevronLeft, Info, MessageCircle, X, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { bangkokDate, formatDate, formatTime } from '../../utils/demo'

export const supportChoices = [
  'อยากให้มีคนรับฟัง', 'อยากได้รับคำแนะนำ', 'อยากให้ช่วยคิดทางออก',
  'อยากนัดพูดคุยเป็นส่วนตัว', 'อยากให้ช่วยประสานงาน', 'ยังไม่แน่ใจว่าต้องการอะไร',
]
export const contactMethods = ['ส่งข้อความ', 'นัดพบเป็นส่วนตัว', 'นัดโทรพูดคุย', 'ส่งสัญญาณโดยไม่ต้องเล่ารายละเอียด']
export const appointmentTypes = ['พบครูเป็นส่วนตัว', 'สนทนาผ่านข้อความ', 'นัดโทรพูดคุย']
export const topics = ['การเรียน', 'การสอบ', 'ครอบครัว', 'เพื่อน', 'ความสัมพันธ์', 'การถูกกลั่นแกล้ง', 'ความคาดหวัง', 'ความมั่นใจ', 'สุขภาพ', 'อนาคต', 'อื่น ๆ']
export const supportiveReplies = [
  'ขอบคุณที่ไว้ใจเล่าให้ครูฟังนะ', 'ครูพร้อมรับฟัง', 'ยังไม่ต้องเล่าทุกอย่างก็ได้',
  'อยากให้ครูช่วยแบบไหนมากที่สุด?', 'เราลองคิดทางออกด้วยกันไหม?',
]

export const bkkDay = (value: string | Date = new Date()) => bangkokDate(new Date(value))

export function addDay(day: string, amount: number) {
  const date = new Date(day + 'T12:00:00+07:00')
  date.setUTCDate(date.getUTCDate() + amount)
  return bkkDay(date)
}

export const dateLabel = (value: string) => formatDate(value, { dateStyle: 'medium' })
export const dateTimeLabel = (value: string) => formatDate(value, { dateStyle: 'medium', timeStyle: 'short' })
export const timeLabel = formatTime

export function PageHead({ title, description, icon: Icon, actions }: {
  title: string; description?: string; icon?: LucideIcon; actions?: ReactNode
}) {
  return <header className="wf-pagehead">
    <div className="wf-pagehead-main">
      {Icon && <span className="wf-page-icon"><Icon size={24} aria-hidden="true" /></span>}
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    </div>
    {actions && <div className="wf-actions">{actions}</div>}
  </header>
}

export function Hint({ children }: { children: ReactNode }) {
  return <div className="wf-hint"><Info size={17} aria-hidden="true" /><div>{children}</div></div>
}

export function Empty({ title, text, icon: Icon = MessageCircle, action }: {
  title: string; text?: string; icon?: LucideIcon; action?: ReactNode
}) {
  return <div className="wf-empty">
    <span className="wf-empty-icon"><Icon size={23} aria-hidden="true" /></span>
    <h3>{title}</h3>{text && <p>{text}</p>}{action}
  </div>
}

export function Back({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="wf-back" to={to}><ChevronLeft size={17} aria-hidden="true" />{children}</Link>
}

export function Status({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={'wf-pill' + (tone ? ' wf-pill-' + tone : '')}>{children}</span>
}

export function Avatar({ name, avatar, skin = 0 }: { name: string; avatar?: string; skin?: number }) {
  return <span className={'wf-avatar wf-avatar-' + skin % 3} aria-hidden="true">{avatar || name.replace(/^ครู\s*/, '').slice(0, 2)}</span>
}

export function Modal({ title, children, onDismiss }: { title: string; children: ReactNode; onDismiss: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (element && !element.open) element.showModal()
    return () => { if (element?.open) element.close() }
  }, [])
  return <dialog className="wf-modal" ref={dialog} aria-label={title} onCancel={onDismiss}>
    <div className="wf-modal-head"><h2>{title}</h2><button type="button" className="wf-icon-button" aria-label="ปิด" onClick={onDismiss}><X size={21} /></button></div>
    {children}
  </dialog>
}

export function Review({ items }: { items: Array<[string, ReactNode]> }) {
  return <dl className="wf-review">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
}

export function Success({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  return <section className="wf-card wf-success">
    <span><Check size={29} aria-hidden="true" /></span>
    <h2>{title}</h2><p>{children}</p><div className="wf-actions">{actions}</div>
  </section>
}

export function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
