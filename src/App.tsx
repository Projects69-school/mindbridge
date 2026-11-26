import { lazy, Suspense, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Empty } from './components/ui'
import { GuideProvider, GuidedDemo, GuideDock } from './components/Guide'
import { Innovation, Landing, PublicShell, RoleSelection } from './pages/Public'

const StudentArea = lazy(() => import('./pages/StudentArea'))
const TeacherArea = lazy(() => import('./pages/TeacherArea'))

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return <GuideProvider>
    <Suspense fallback={<main className="route-loading" role="status">กำลังเปิดพื้นที่ MindBridge…</main>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/innovation" element={<Innovation />} />
        <Route path="/demo" element={<GuidedDemo />} />
        <Route path="/student/*" element={<StudentArea />} />
        <Route path="/teacher/*" element={<TeacherArea />} />
        <Route path="*" element={<PublicShell><Empty title="ไม่พบหน้านี้" description="เลือกกลับหน้าหลักหรือเข้าสู่โหมดสาธิตอีกครั้ง"><Link to="/" className="btn btn-primary">กลับหน้าหลัก</Link></Empty></PublicShell>} />
      </Routes>
    </Suspense>
    <GuideDock />
  </GuideProvider>
}
