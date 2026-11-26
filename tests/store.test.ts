import { describe, expect, it } from 'vitest'
import { createDemoStore } from '../src/context/store'
import { STUDENT_ID, TEACHER_ID, offsetDate, sharedFor, weekday } from '../src/utils/demo'

describe('temporary demonstration store', () => {
  it('creates requests, conversations, replies, and recipient notifications in one session', () => {
    const { actions, getState } = createDemoStore()
    const requestId = actions.submitRequest({ teacherId: TEACHER_ID, method: 'ส่งสัญญาณโดยไม่ต้องเล่ารายละเอียด', preference: 'อยากให้มีคนรับฟัง' })
    expect(getState().notifications[0].recipientId).toBe(TEACHER_ID)
    expect(actions.setRequestStatus(requestId, 'accepted')).toBe(true)
    const conversation = getState().conversations.find(row => row.requestId === requestId)!
    expect(conversation.studentId).toBe(STUDENT_ID)
    expect(actions.sendMessage(conversation.id, 'teacher', 'ครูพร้อมรับฟัง')).toBe(true)
    expect(getState().messages.at(-1)?.text).toBe('ครูพร้อมรับฟัง')
    expect(getState().notifications[0].recipientId).toBe(STUDENT_ID)
    actions.markMessages(conversation.id, 'student')
    expect(getState().messages.at(-1)?.read).toBe(true)
    actions.reset()
    expect(getState().requests.find(row => row.id === requestId)).toBeUndefined()
    expect(getState().teacherId).toBe(TEACHER_ID)
  })

  it('keeps shared journal copies separate and applies revocation by recipient', () => {
    const { actions, getState } = createDemoStore()
    const privateEntry = getState().journals[0]
    const excerpt = 'เลือกแค่วิชาเดียวก่อน'
    const key = actions.share(TEACHER_ID, { kind:'journal', sourceId:privateEntry.id, label:'ข้อความที่เลือก', text:excerpt })
    expect(sharedFor(getState(), TEACHER_ID).find(row => row.id === key)?.text).toBe(excerpt)
    expect(sharedFor(getState(), 'teacher-ton').find(row => row.id === key)).toBeUndefined()
    expect(getState().journals.find(row => row.id === privateEntry.id)?.body).toBe(privateEntry.body)
    actions.update('sharedItems', rows => rows.map(row => row.id === key ? { ...row, revoked: true } : row))
    expect(sharedFor(getState(), TEACHER_ID).find(row => row.id === key)).toBeUndefined()
  })

  it('rejects occupied or unavailable student slots and frees a cancelled slot', () => {
    const { actions, getState } = createDemoStore()
    const date = Array.from({ length: 7 }, (_, index) => offsetDate(index + 8)).find(day => weekday(day) === 2)!
    const draft = { studentId:STUDENT_ID, teacherId:TEACHER_ID, date, time:'14:00', type:'พบครูเป็นส่วนตัว', requestedBy:'student' as const, note:'' }
    expect(actions.saveAppointment({ ...draft,time:'14:55' })).toBeNull()
    const first = actions.saveAppointment(draft)
    expect(first).toBeTruthy()
    expect(actions.saveAppointment(draft)).toBeNull()
    expect(actions.setAppointmentStatus(first!, 'cancelled', 'student')).toBe(true)
    expect(getState().notifications[0].role).toBe('teacher')
    expect(actions.saveAppointment(draft)).toBeTruthy()
  })

  it('adds follow-up updates once and delivers feedback to the assigned teacher', () => {
    const { actions, getState } = createDemoStore()
    const followup = { id:'unit-follow',requestId:'request-fah',studentId:STUDENT_ID,teacherId:TEACHER_ID,date:offsetDate(8),title:'ชวนทบทวน',tasks:[],note:'ส่วนตัว',completed:false,createdAt:new Date().toISOString() }
    actions.saveFollowUp(followup)
    const events = getState().requests.find(row => row.id === 'request-fah')?.events.length
    const notices = getState().notifications.length
    actions.saveFollowUp({ ...followup, note:'แก้คำในบันทึก' })
    expect(getState().requests.find(row => row.id === 'request-fah')?.events).toHaveLength(events!)
    expect(getState().notifications).toHaveLength(notices)
    expect(actions.submitFeedback('request-fah', { heard: 'ใช่' }, '', followup.id)).toBe(true)
    expect(getState().notifications[0].recipientId).toBe(TEACHER_ID)
  })
})
