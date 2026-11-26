import type { ReactNode } from 'react'
import { CircleHelp, Info, type LucideIcon } from 'lucide-react'

export function ToolHeading({ icon: Icon, label, title, description, action }: {
  icon: LucideIcon; label: string; title: string; description: string; action?: ReactNode
}) {
  return <header className="mt-page-heading">
    <div className="mt-heading-copy">
      <p className="mt-eyebrow"><Icon size={17} aria-hidden="true" />{label}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action}
  </header>
}

export function ToolSection({ title, description, action, children, className = '' }: {
  title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string
}) {
  return <section className={`mt-card ${className}`}>
    <div className="mt-section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
    {children}
  </section>
}

export function ToolEmpty({ title, children, icon: Icon = CircleHelp }: {
  title: string; children?: ReactNode; icon?: LucideIcon
}) {
  return <div className="mt-empty"><span className="mt-icon"><Icon aria-hidden="true" size={23} /></span><strong>{title}</strong>{children && <p>{children}</p>}</div>
}

export function ToolNotice({ children, icon: Icon = Info }: { children: ReactNode; icon?: LucideIcon }) {
  return <aside className="mt-notice"><Icon aria-hidden="true" size={19} /><div>{children}</div></aside>
}

export function ToolStatus({ children, tone = 'purple' }: { children: ReactNode; tone?: 'purple' | 'mint' | 'yellow' | 'gray' }) {
  return <span className={`mt-status mt-status--${tone}`}>{children}</span>
}

export const thaiDate = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })
export const thaiDateTime = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' })

export function dateKey(input = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format(input)
}

export function dateLabel(value: string, includeTime = false) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00+07:00` : value)
  return Number.isNaN(+date) ? 'ยังไม่ได้กำหนด' : (includeTime ? thaiDateTime : thaiDate).format(date)
}
