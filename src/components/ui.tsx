import { useEffect, useRef } from 'react'
import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import { Heart, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { demoNotice } from '../utils/demo'

type Icon = ComponentType<{ size?: number; className?: string }>
export function Brand({ subtitle = false }: { subtitle?: boolean }) {
  return <Link to="/" className="brand" aria-label="MindBridge หน้าหลัก">
    <img src={`${import.meta.env.BASE_URL}assets/logo.svg`} width="40" height="40" alt="" />
    <span><b>Mind<span>Bridge</span></b>{subtitle && <small>สะพานใจ เชื่อมครู เชื่อมนักเรียน</small>}</span>
  </Link>
}
export function DemoNotice({ className = '' }: { className?: string }) {
  return <div className={`demo-notice ${className}`}><ShieldCheck size={16} /> <span>{demoNotice}</span></div>
}
export function PageHeader({ title, description, icon: Symbol, actions, eyebrow }: {
  title: string; description?: string; icon?: Icon; actions?: ReactNode; eyebrow?: string
}) {
  return <header className="page-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{Symbol && <Symbol size={31} />}{title}</h1>{description && <p>{description}</p>}</div>
    {actions && <div className="page-actions">{actions}</div>}
  </header>
}
export function Empty({ title, description, icon: Symbol = Heart, children }: PropsWithChildren<{ title: string; description?: string; icon?: Icon }>) {
  return <div className="empty"><div className="icon-tile"><Symbol size={22} /></div><h3>{title}</h3>{description && <p>{description}</p>}{children}</div>
}
export function Badge({ children, tone = 'purple' }: PropsWithChildren<{ tone?: string }>) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
export function Modal({ title, onClose, children }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])
  return <dialog ref={ref} className="modal" aria-label={title} onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal-content">
      <div className="modal-heading"><h2>{title}</h2><button type="button" className="icon-btn" onClick={onClose} aria-label="ปิด"><X size={21} /></button></div>
      {children}
    </div>
  </dialog>
}
