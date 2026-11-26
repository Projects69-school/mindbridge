import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, Bell, BookOpen, CalendarDays, ChartNoAxesColumn, ChevronDown, Compass, Flower2, GraduationCap, HandHeart,
  HeartHandshake, Home, LifeBuoy, Menu, MessageCircle, PanelTop, RotateCcw, Settings2, Shuffle, Sparkles, Users, Workflow, X,
} from 'lucide-react'
import { useDemo } from '../context/DemoContext'
import type { Role } from '../types/demo'
import { forStudent, forTeacher, notificationsFor } from '../utils/demo'
import { Brand, DemoNotice } from './ui'
import '../styles/app.css'

const studentNav = [
  ['dashboard', 'หน้าหลัก', Home], ['emotions', 'อารมณ์ของฉัน', Flower2], ['journal', 'บันทึกส่วนตัว', BookOpen],
  ['trust-ladder', 'สะพานใจ', Compass], ['support', 'ขอความช่วยเหลือ', HeartHandshake], ['messages', 'ข้อความ', MessageCircle],
  ['appointments', 'นัดหมาย', CalendarDays], ['wellness', 'กิจกรรมดูแลใจ', Sparkles], ['journey', 'เส้นทางการดูแล', Workflow], ['settings', 'ตั้งค่า', Settings2],
] as const
const navParents: Record<string, string> = {
  'emotion-decoder': 'emotions', 'mood-timeline': 'emotions', wellbeing: 'emotions',
  drawing: 'journal', voice: 'journal', teachers: 'support', privacy: 'settings',
  plans: 'care', notes: 'care', availability: 'settings',
}
const teacherNav = [
  ['dashboard', 'ภาพรวม', Home], ['requests', 'คำขอความช่วยเหลือ', HandHeart], ['students', 'นักเรียนในความดูแล', Users],
  ['messages', 'ข้อความ', MessageCircle], ['appointments', 'นัดหมาย', CalendarDays], ['care', 'การดูแลนักเรียน', Workflow],
  ['follow-ups', 'ติดตามผล', Activity], ['guidance', 'คู่มือสำหรับครู', BookOpen], ['referrals', 'ส่งต่อผู้เชี่ยวชาญ', LifeBuoy],
  ['reports', 'รายงาน', ChartNoAxesColumn], ['settings', 'ตั้งค่า', Settings2],
] as const

export function AppLayout({ role }: { role: Role }) {
  const { state, actions, confirm, toast } = useDemo()
  const location = useLocation()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [toolbar, setToolbar] = useState(false)
  const student = role === 'student'
  const person = student ? forStudent(state) : forTeacher(state)
  const nav = student ? studentNav : teacherNav
  const route = location.pathname.split('/')[2]
  const current = nav.find(([path]) => path === (navParents[route] ?? route))
  const unread = notificationsFor(state, role).filter(notice => !notice.read).length
  useEffect(() => { setExpanded(false); setToolbar(false) }, [location.pathname])
  useEffect(() => {
    document.documentElement.style.fontSize = person.largeText ? '112.5%' : ''
    return () => { document.documentElement.style.fontSize = '' }
  }, [person.largeText])
  async function reset() {
    const yes = await confirm({ title: 'เริ่มการสาธิตใหม่?', message: 'การเปลี่ยนแปลงในแท็บนี้จะถูกล้างและระบบจะคืนข้อมูลสมมติชุดแรก', label: 'เริ่มการสาธิตใหม่' })
    if (yes) { actions.reset(); navigate(`/${role}/dashboard`); setToolbar(false); toast('คืนข้อมูลสาธิตชุดเริ่มต้นแล้ว') }
  }
  function switchRole(next: Role) {
    if (next === 'teacher' && role === 'student' && state.requests[0]?.studentId === forStudent(state).id && state.requests[0]?.status === 'new') actions.setTeacher(state.requests[0].teacherId)
    setToolbar(false)
    navigate(`/${next}/dashboard`)
  }
  function navLinks(mobile = false) {
    const entries = mobile ? nav.filter(([path]) => (student ? ['dashboard','emotions','support','messages','settings'] : ['dashboard','requests','messages','appointments','settings']).includes(path)) : nav
    return entries.map(([path, label, Icon]) => <NavLink
      key={path} to={`/${role}/${path}`}
      className={({ isActive }) => isActive || current?.[0] === path ? 'app-nav-link active' : 'app-nav-link'}>
      <Icon size={mobile ? 21 : 18} /><span>{mobile && student && path === 'settings' ? 'โปรไฟล์' : mobile && student && path === 'emotions' ? 'อารมณ์' : mobile && path === 'requests' ? 'คำขอ' : label}</span>
    </NavLink>)
  }
  return <div className={`app-frame app-${role}`} data-contrast={person.highContrast} data-motion={person.reducedMotion ? 'reduce' : undefined}>
    <button className="skip-link btn btn-primary" onClick={() => document.getElementById('main-content')?.focus()}>ข้ามไปยังเนื้อหา</button>
    {expanded && <button type="button" aria-label="ปิดเมนูด้านข้าง" className="sidebar-overlay" onClick={() => setExpanded(false)} />}
    <aside className={`app-sidebar ${expanded ? 'app-sidebar-open' : ''}`}>
      <div className="app-sidebar-brand"><Brand /><button type="button" className="icon-btn sidebar-dismiss" onClick={() => setExpanded(false)} aria-label="ปิดเมนู"><X size={18} /></button></div>
      <div className="sidebar-role"><span className="sidebar-role-icon">{student ? <GraduationCap size={16} /> : <HandHeart size={16} />}</span>{student ? 'พื้นที่นักเรียน' : 'พื้นที่คุณครู'}</div>
      <nav className="app-nav" aria-label={student ? 'เมนูนักเรียน' : 'เมนูคุณครู'}>{navLinks()}</nav>
      {student ? <Link to="/student/urgent" className="sidebar-help"><LifeBuoy size={17} /><span>ต้องการความช่วยเหลือเร่งด่วน</span></Link>
        : <Link to="/teacher/availability" className="sidebar-help"><CalendarDays size={17} /><span>เวลาที่เปิดให้นัดหมาย</span></Link>}
      <div className="sidebar-profile"><span className="profile-avatar">{person.avatar}</span><div><strong>{person.name}</strong><small>{'classroom' in person ? person.classroom : person.title}</small></div></div>
    </aside>
    <div className="app-workspace">
      <header className="app-header">
        <div className="app-header-left"><button type="button" className="icon-btn sidebar-trigger" aria-label="เปิดเมนู" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><Menu size={20} /></button>
          <span>{student ? 'พื้นที่นักเรียน' : 'พื้นที่คุณครู'}</span>{current && <><span className="header-divider">/</span><strong>{current[1]}</strong></>}</div>
        <div className="app-header-right">
          {student && <Link to="/student/urgent" aria-label="ต้องการความช่วยเหลือเร่งด่วน" title="ต้องการความช่วยเหลือเร่งด่วน" className="icon-btn compact-urgent"><LifeBuoy size={19} /></Link>}
          <Link to={`/${role}/notifications`} aria-label={unread ? `การแจ้งเตือน ${unread} รายการใหม่` : 'การแจ้งเตือน'} className="icon-btn notification-link"><Bell size={19} />{unread > 0 && <span>{Math.min(unread, 99)}</span>}</Link>
          <div className="app-toolbar">
            <button type="button" className="btn btn-secondary toolbar-trigger" aria-expanded={toolbar} onClick={() => setToolbar(!toolbar)}><Shuffle size={17} /> <span>โหมดสาธิต</span> <ChevronDown size={14} /></button>
            {toolbar && <div className="toolbar-menu">
              <div className="toolbar-caption">การสาธิต MindBridge</div>
              <button type="button" onClick={() => switchRole('student')}><GraduationCap size={18} /> สลับไปบัญชีนักเรียน</button>
              <button type="button" onClick={() => switchRole('teacher')}><HandHeart size={18} /> สลับไปบัญชีครู</button>
              {!student && <label className="field toolbar-teacher">ครูที่กำลังทดลอง<select value={state.teacherId} onChange={event => actions.setTeacher(event.target.value)}>{state.teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>}
              <Link to="/"><PanelTop size={18} /> กลับหน้าหลัก</Link>
              <Link to="/demo"><Sparkles size={18} /> สาธิตสำหรับกรรมการ</Link>
              <button type="button" onClick={reset}><RotateCcw size={18} /> เริ่มการสาธิตใหม่</button>
            </div>}
          </div>
        </div>
      </header>
      <DemoNotice />
      <main id="main-content" tabIndex={-1} className="app-main"><Outlet key={state.revision} /></main>
      <nav className="mobile-nav" aria-label="เมนูด่วน">{navLinks(true)}</nav>
    </div>
  </div>
}
