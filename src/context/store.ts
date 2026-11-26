import { createSeed } from '../data/mockData'
import type { AppointmentDraft, AppointmentStatus, DemoState, FollowUp, NotificationDraft, Referral, RequestDraft, RequestStatus, Role, SharedDraft, SharedItem, SupportNote, SupportPlan, SupportRequest } from '../types/demo'
import { activeAppointment, appointmentStatus, bangkokDate, id, now, requestStatus, STUDENT_ID, weekday } from '../utils/demo'

function put<T extends { id: string }>(list: T[], value: T): T[] {
  return list.some(row => row.id === value.id) ? list.map(row => row.id === value.id ? value : row) : [value, ...list]
}

export function createDemoStore(seed = createSeed()) {
  let state = seed
  const listeners = new Set<() => void>()
  function commit(next: DemoState) {
    state = next
    listeners.forEach(listener => listener())
  }
  function withNotice(next: DemoState, notice: NotificationDraft) {
    const person = (notice.role === 'student' ? next.students : next.teachers).find(user => user.id === notice.recipientId)
    if (!person?.notifications || person.notificationTypes?.[notice.type] === false) return next
    return { ...next, notifications: [{ ...notice, id: id(), read: false, createdAt: now() }, ...next.notifications] }
  }
  function addEvent(next: DemoState, requestId: string, title: string, detail?: string, status?: RequestStatus): DemoState {
    return { ...next, requests: next.requests.map(request => request.id === requestId ? {
      ...request, status: status ?? request.status, events: [...request.events, { id: id(), title, detail, date: now() }],
    } : request) }
  }
  function copyShare(teacherId: string, draft: SharedDraft): SharedItem {
    return { ...draft, id: id(), studentId: STUDENT_ID, teacherId, createdAt: now(), owner: 'student' }
  }
  function isFree(data: AppointmentDraft, editId?: string) {
    return !state.appointments.some(appointment => appointment.id !== editId && appointment.teacherId === data.teacherId && appointment.date === data.date && appointment.time === data.time && activeAppointment(appointment.status))
  }
  function onAppointment(next: DemoState, appointmentId: string, status: AppointmentStatus, role: Role) {
    const appointment = next.appointments.find(row => row.id === appointmentId)!
    const label = appointmentStatus[status]
    const updated = appointment.requestId ? addEvent(next, appointment.requestId, status === 'confirmed' ? 'นัดหมายแล้ว' : `การนัดหมาย: ${label}`, `${appointment.date} · ${appointment.time} น.`) : next
    const recipientRole = role === 'student' ? 'teacher' : 'student'
    return withNotice(updated, { role: recipientRole, recipientId: recipientRole === 'student' ? appointment.studentId : appointment.teacherId, type: 'appointment', title: status === 'pending' ? 'มีคำขอนัดหมาย' : `การนัดหมาย: ${label}`, detail: `${appointment.type} · ${appointment.time} น.`, href: `/${recipientRole}/appointments?id=${appointmentId}` })
  }

  const actions = {
    update<K extends keyof DemoState>(key: K, updater: (current: DemoState[K]) => DemoState[K]) {
      const result = updater(state[key])
      if (result !== state[key]) commit({ ...state, [key]: result })
    },
    reset() { commit(createSeed(state.revision + 1)) },
    setTeacher(teacherId: string) {
      if (state.teachers.some(teacher => teacher.id === teacherId)) commit({ ...state, teacherId })
    },
    notify(draft: NotificationDraft) { commit(withNotice(state, draft)) },
    markNotification(notificationId: string) {
      actions.update('notifications', notifications => notifications.map(notice => notice.id === notificationId ? { ...notice, read: true } : notice))
    },
    markAllNotifications(role: Role) {
      const recipientId = role === 'student' ? STUDENT_ID : state.teacherId
      actions.update('notifications', notifications => notifications.map(notice => notice.role === role && notice.recipientId === recipientId ? { ...notice, read: true } : notice))
    },
    share(teacherId: string, draft: SharedDraft) {
      const item = copyShare(teacherId, draft)
      const assigned = state.assignments.some(row => row.studentId === STUDENT_ID && row.teacherId === teacherId)
      const assignments = assigned ? state.assignments : [...state.assignments, { studentId: STUDENT_ID, teacherId }]
      commit(withNotice({ ...state, sharedItems: [item, ...state.sharedItems], assignments }, { role:'teacher', recipientId:teacherId, type:'shared', title:'นักเรียนแบ่งปันข้อมูลที่เลือก', detail:item.label, href:`/teacher/students?student=${STUDENT_ID}` }))
      return item.id
    },
    submitRequest(draft: RequestDraft) {
      const requestId = id()
      const shared = (draft.shared ?? []).map(item => copyShare(draft.teacherId, item))
      const time = now()
      const request: SupportRequest = {
        id: requestId, studentId: STUDENT_ID, teacherId: draft.teacherId, preference: draft.preference, method: draft.method,
        topic: draft.topic ?? '', message: draft.message ?? '', emotions: draft.emotions ?? [], status: 'new', createdAt: time,
        sharedIds: shared.map(item => item.id),
        events: [{ id: id(), title: 'ส่งคำขอแล้ว', date: time }, { id: id(), title: 'ครูได้รับคำขอแล้ว', date: time }],
      }
      const assigned = state.assignments.some(assignment => assignment.studentId === STUDENT_ID && assignment.teacherId === draft.teacherId)
      commit(withNotice({ ...state, sharedItems: [...shared, ...state.sharedItems], requests: [request, ...state.requests],
        assignments: assigned ? state.assignments : [...state.assignments, { studentId: STUDENT_ID, teacherId: draft.teacherId }],
      }, { role: 'teacher', recipientId: draft.teacherId, type: 'request', title: 'คำขอความช่วยเหลือใหม่', detail: draft.preference, href: `/teacher/requests?id=${requestId}` }))
      return requestId
    },
    setRequestStatus(requestId: string, status: RequestStatus) {
      const request = state.requests.find(row => row.id === requestId)
      if (!request || request.status === status) return false
      const time = now()
      const openChat = status === 'accepted' && !request.conversationId
      const conversationId = openChat ? id() : request.conversationId
      const title = request.status === 'closed' ? 'เปิดคำขออีกครั้ง' : requestStatus[status]
      const next: DemoState = {
        ...state,
        conversations: openChat ? [{ id: conversationId!, studentId: request.studentId, teacherId: request.teacherId, requestId, archivedBy: [], createdAt: time }, ...state.conversations] : state.conversations,
        requests: state.requests.map(row => row.id === requestId ? {
          ...row, conversationId, status,
          acceptedAt: row.acceptedAt ?? (status === 'accepted' ? time : undefined),
          closedAt: status === 'closed' ? time : undefined,
          events: [...row.events, { id: id(), date: time, title }],
        } : row),
      }
      const reopens = request.status === 'closed'
      commit(withNotice(next, { role: 'student', recipientId: request.studentId, type: 'request', title, detail: request.preference, href: `/student/journey?id=${requestId}` }))
      if (reopens) actions.notify({ role:'teacher', recipientId:request.teacherId, type:'request', title, detail:request.preference, href:`/teacher/requests?id=${requestId}` })
      return true
    },
    sendMessage(conversationId: string, role: Role, text: string, sharedIds: string[] = [], sharedDrafts: SharedDraft[] = []) {
      const conversation = state.conversations.find(row => row.id === conversationId)
      const body = text.trim()
      if (!conversation || (!body && !sharedIds.length && !sharedDrafts.length) || (role === 'teacher' ? conversation.teacherId !== state.teacherId : conversation.studentId !== STUDENT_ID)) return false
      const copies = sharedDrafts.map(draft => ({ ...copyShare(conversation.teacherId, draft), studentId: conversation.studentId, owner: role }))
      const existing = sharedIds.filter(itemId => state.sharedItems.some(item => item.id === itemId && !item.revoked && item.teacherId === conversation.teacherId && item.studentId === conversation.studentId))
      if (!body && !copies.length && !existing.length) return false
      const next: DemoState = { ...state, sharedItems: [...copies, ...state.sharedItems], messages: [...state.messages, { id: id(), conversationId, sender: role, text: body, createdAt: now(), read: false, sharedIds: [...existing, ...copies.map(item => item.id)] }] }
      const request = state.requests.find(row => row.id === conversation.requestId)
      const firstReply = role === 'teacher' && !state.messages.some(message => message.conversationId === conversationId && message.sender === 'teacher')
      const updated = request && (request.status === 'accepted' || firstReply) ? addEvent(next, request.id, role === 'teacher' ? 'ครูตอบกลับแล้ว' : 'เริ่มพูดคุย', undefined, request.status === 'accepted' ? 'talking' : request.status) : next
      const recipientRole = role === 'student' ? 'teacher' : 'student'
      commit(withNotice(updated, { role: recipientRole, recipientId: role === 'student' ? conversation.teacherId : conversation.studentId, type: 'message', title: role === 'teacher' ? 'ครูตอบกลับข้อความแล้ว' : 'ข้อความใหม่จากนักเรียน', detail: 'เปิดข้อความในบทสนทนา', href: `/${recipientRole}/messages?id=${conversationId}` }))
      return true
    },
    markMessages(conversationId: string, role: Role) {
      actions.update('messages', messages => messages.some(message => message.conversationId === conversationId && message.sender !== role && !message.read)
        ? messages.map(message => message.conversationId === conversationId && message.sender !== role ? { ...message, read: true } : message) : messages)
    },
    saveAppointment(draft: AppointmentDraft, editId?: string, status: AppointmentStatus = 'pending') {
      if (!draft.date || !draft.time || draft.date < bangkokDate() || (activeAppointment(status) && !isFree(draft, editId))) return null
      const availability = state.availability.find(row => row.teacherId === draft.teacherId)
      if (draft.requestedBy === 'student' && (!availability?.available || !availability.weekdays.includes(weekday(draft.date)) || !availability.slots.some(slot => slot.day === weekday(draft.date) && slot.time === draft.time))) return null
      const old = state.appointments.find(row => row.id === editId)
      if (editId && !old) return null
      const appointment = { ...draft, id: editId ?? id(), createdAt: old?.createdAt ?? now(), status }
      commit(onAppointment({ ...state, appointments: put(state.appointments, appointment) }, appointment.id, status, draft.requestedBy))
      return appointment.id
    },
    setAppointmentStatus(appointmentId: string, status: AppointmentStatus, actor?: Role) {
      const appointment = state.appointments.find(row => row.id === appointmentId)
      if (!appointment || appointment.status === status || (activeAppointment(status) && !isFree(appointment, appointmentId))) return false
      const inferredActor = appointment.status === 'proposed' ? 'student' : 'teacher'
      commit(onAppointment({ ...state, appointments: put(state.appointments, { ...appointment, status }) }, appointmentId, status, actor ?? inferredActor))
      return true
    },
    submitFeedback(requestId: string, answers: Record<string, string>, text: string, followUpId?: string) {
      const request = state.requests.find(row => row.id === requestId && row.studentId === STUDENT_ID)
      if (!request || (!Object.values(answers).some(Boolean) && !text.trim())) return false
      const feedback = { id: id(), requestId, followUpId, studentId: request.studentId, teacherId: request.teacherId, answers, text: text.trim(), createdAt: now() }
      commit(withNotice({ ...state, feedback: [feedback, ...state.feedback] }, { role:'teacher', recipientId:request.teacherId, type:'feedback', title:'นักเรียนส่งความคิดเห็นแล้ว',detail:'ดูความคิดเห็นจากเส้นทางการดูแล',href:`/teacher/care?request=${requestId}` }))
      return true
    },
    savePlan(plan: SupportPlan) {
      const existing = state.plans.find(row => row.id === plan.id)
      const next = { ...state, plans: put(state.plans, plan) }
      const request = state.requests.find(row => row.id === plan.requestId)
      commit(!existing && request ? addEvent(next, plan.requestId, 'กำหนดแผนการดูแล', plan.goal, ['new','accepted','talking'].includes(request.status) ? 'planned' : undefined) : next)
    },
    saveNote(note: SupportNote) { actions.update('notes', notes => put(notes, note)) },
    saveFollowUp(followUp: FollowUp) {
      const existing = state.followUps.find(row => row.id === followUp.id)
      const next = { ...state, followUps: put(state.followUps, followUp) }
      if (existing && existing.date === followUp.date && existing.completed === followUp.completed) { commit(next); return }
      const title = followUp.completed ? 'ติดตามผลเสร็จสิ้น' : existing && existing.date !== followUp.date ? 'เปลี่ยนวันติดตามผล' : 'นัดติดตามผล'
      const request = state.requests.find(row => row.id === followUp.requestId)
      const status = !followUp.completed && request && !['closed','referred'].includes(request.status) ? 'followup' : undefined
      commit(withNotice(addEvent(next, followUp.requestId, title, followUp.title, status), { role:'student',recipientId:followUp.studentId,type:'followup',title,detail:followUp.title,href:`/student/journey?id=${followUp.requestId}` }))
    },
    saveReferral(referral: Referral) {
      const existing = state.referrals.find(row => row.id === referral.id)
      const next = { ...state, referrals: put(state.referrals, referral) }
      if (referral.status === 'draft' || existing?.status === referral.status) { commit(next); return }
      const title = referral.status === 'sent' ? 'สร้างการส่งต่อจำลองแล้ว' : 'อัปเดตสถานะการส่งต่อจำลอง'
      commit(withNotice(addEvent(next, referral.requestId, title, referral.destination, referral.status === 'sent' ? 'referred' : undefined), { role:'student',recipientId:referral.studentId,type:'referral',title,detail:referral.destination,href:`/student/journey?id=${referral.requestId}` }))
    },
  }
  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    actions,
  }
}
export type DemoActions = ReturnType<typeof createDemoStore>['actions']
