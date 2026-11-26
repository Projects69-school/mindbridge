import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { StudentDashboard } from './Dashboards'
import * as Reflection from './StudentReflection'
import { Privacy, Settings } from './TeacherTools'
import * as Workflow from './Workflow'

export default function StudentArea() {
  return <Routes><Route element={<AppLayout role="student" />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<StudentDashboard />} />
    <Route path="emotions" element={<Reflection.CheckIn />} />
    <Route path="emotion-decoder" element={<Reflection.EmotionDecoder />} />
    <Route path="mood-timeline" element={<Reflection.MoodTimeline />} />
    <Route path="wellbeing" element={<Reflection.Wellbeing />} />
    <Route path="journal" element={<Reflection.Journal />} />
    <Route path="drawing" element={<Reflection.Drawing />} />
    <Route path="voice" element={<Reflection.Voice />} />
    <Route path="trust-ladder" element={<Reflection.TrustLadder />} />
    <Route path="support" element={<Workflow.Support />} />
    <Route path="teachers" element={<Workflow.TeacherDirectory />} />
    <Route path="messages" element={<Workflow.Chat role="student" />} />
    <Route path="appointments" element={<Workflow.Appointments role="student" />} />
    <Route path="wellness" element={<Reflection.Wellness />} />
    <Route path="journey" element={<Workflow.Journey />} />
    <Route path="notifications" element={<Workflow.Notifications role="student" />} />
    <Route path="settings" element={<Settings />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="urgent" element={<Reflection.Urgent />} />
    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
  </Route></Routes>
}
