import { useState } from 'react'
import { Bell, CalendarDays, Check, CheckCheck, ClipboardCheck, Clock, HandHeart, HeartHandshake, MessageCircle, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemo } from '../../context/DemoContext'
import type { Role } from '../../types/demo'
import { forStudent, forTeacher, notificationsFor } from '../../utils/demo'
import { Empty, PageHead, Status, dateTimeLabel } from './ui'

const notificationChoices = {
  request: { label: 'คำขอความช่วยเหลือ', Icon: HeartHandshake },
  message: { label: 'ข้อความใหม่', Icon: MessageCircle },
  appointment: { label: 'นัดหมาย', Icon: CalendarDays },
  followup: { label: 'ติดตามผล', Icon: Clock },
  feedback: { label: 'ความคิดเห็นจากนักเรียน', Icon: HandHeart },
  referral: { label: 'สถานะการส่งต่อ', Icon: ClipboardCheck },
  shared: { label: 'ข้อมูลที่นักเรียนแบ่งปัน', Icon: ClipboardCheck },
}
type NoticeKind = keyof typeof notificationChoices

export function Notifications({ role }: { role: Role }) {
  const { state, actions } = useDemo()
  const [onlyUnread, setOnlyUnread] = useState(false)
  const person = role === 'student' ? forStudent(state) : forTeacher(state)
  const notifications = notificationsFor(state, role).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  const unread = notifications.filter((row) => !row.read)
  const visible = onlyUnread ? unread : notifications
  const preferences: NoticeKind[] = role === 'student' ? ['request', 'message', 'appointment', 'followup', 'referral'] : ['request', 'message', 'appointment', 'followup', 'feedback', 'shared']

  function changePreference(key: NoticeKind, enabled: boolean) {
    const update = <T extends typeof person>(rows: T[]) => rows.map((profile) => profile.id === person.id ? {
      ...profile, notificationTypes: { ...profile.notificationTypes, [key]: enabled },
    } : profile)
    if (role === 'student') actions.update('students', update)
    else actions.update('teachers', update)
  }

  return <div className="wf">
    <PageHead title="การแจ้งเตือน" icon={Bell} description="ดูข้อความใหม่ นัดหมาย และความคืบหน้าจากการดูแลในสาธิต"
      actions={<button className="wf-button" type="button" disabled={!unread.length} onClick={() => actions.markAllNotifications(role)}><CheckCheck size={17} /> อ่านทั้งหมดแล้ว</button>} />
    <section className="wf-card">
      <div className="wf-group-head">
        <div className="wf-tabs" aria-label="กรองการแจ้งเตือน"><button type="button" className="wf-tab" aria-pressed={!onlyUnread} onClick={() => setOnlyUnread(false)}>ทั้งหมด</button>
          <button type="button" className="wf-tab" aria-pressed={onlyUnread} onClick={() => setOnlyUnread(true)}>ยังไม่ได้อ่าน</button></div>
        <Status tone={unread.length ? '' : 'gray'}>{unread.length} รายการใหม่</Status>
      </div>
      {visible.length ? <div className="wf-row-list">{visible.map((row) => {
        const Icon = notificationChoices[row.type as NoticeKind]?.Icon || Bell
        return <div className={'wf-row wf-notice-row' + (row.read ? '' : ' wf-notice-unread')} key={row.id}>
          <Link to={row.href} className="wf-row-main wf-notice-link" onClick={() => actions.markNotification(row.id)}>
            <span className="wf-choice-icon"><Icon aria-hidden="true" size={18} /></span>
            <div><strong>{row.title}</strong><p>{row.detail}</p><small>{dateTimeLabel(row.createdAt)}</small></div>
          </Link>
          {!row.read && <button className="wf-icon-button" aria-label={'ทำเครื่องหมายว่าอ่านแล้ว: ' + row.title} title="ทำเครื่องหมายว่าอ่านแล้ว" type="button" onClick={() => actions.markNotification(row.id)}><Check size={18} /></button>}
        </div>
      })}</div> : <Empty title={onlyUnread ? 'อ่านครบแล้ว' : 'ยังไม่มีการแจ้งเตือน'} text={onlyUnread ? 'เมื่อมีความคืบหน้าใหม่ จะเห็นที่นี่' : 'เมื่อมีข้อความหรือนัดหมายใหม่ รายการจะแสดงที่นี่'} icon={Bell} />}
    </section>
    <section className="wf-card">
      <div className="wf-group-head"><div className="wf-person"><span className="wf-choice-icon"><Settings size={17} aria-hidden="true" /></span><div><h2>ประเภทการแจ้งเตือนที่ต้องการ</h2><p>{person.notifications ? 'เลือกเฉพาะเรื่องที่อยากรับแจ้งในสาธิต' : 'ปิดการแจ้งเตือนทั้งหมดอยู่ เปิดได้จากการตั้งค่า'}</p></div></div>
        <Link className="wf-button" to={`/${role}/settings?tab=notifications`}>เปิดการตั้งค่า</Link></div>
      <div className="wf-grid wf-grid-three">{preferences.map((value) => <label key={value} className="wf-check"><input type="checkbox" disabled={!person.notifications} checked={person.notificationTypes?.[value] !== false} onChange={(event) => changePreference(value, event.target.checked)} /> {notificationChoices[value].label}</label>)}</div>
    </section>
  </div>
}
