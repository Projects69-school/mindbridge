import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { TeacherDashboard } from './Dashboards'
import * as Tools from './TeacherTools'
import * as Workflow from './Workflow'

export default function TeacherArea() {
  return <Routes><Route element={<AppLayout role="teacher" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<TeacherDashboard />} />
    <Route path="requests" element={<Workflow.TeacherRequests />} />
    <Route path="students" element={<Tools.StudentManagement />} />
    <Route path="messages" element={<Workflow.Chat role="teacher" />} />
    <Route path="appointments" element={<Workflow.Appointments role="teacher" />} />
    <Route path="care" element={<Tools.CareLoop />} />
    <Route path="follow-ups" element={<Tools.FollowUps />} />
    <Route path="guidance" element={<Tools.Guidance />} />
    <Route path="referrals" element={<Tools.Referrals />} />
    <Route path="plans" element={<Tools.SupportPlans />} />
    <Route path="notes" element={<Tools.SupportNotes />} />
    <Route path="reports" element={<Tools.Analytics />} />
    <Route path="availability" element={<Tools.Availability />} />
    <Route path="notifications" element={<Workflow.Notifications role="teacher" />} />
    <Route path="settings" element={<Tools.Settings />} />
    <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
  </Route></Routes>
}
