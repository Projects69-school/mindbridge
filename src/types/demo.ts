export type Role = 'student' | 'teacher'
export type RequestStatus = 'new' | 'accepted' | 'talking' | 'planned' | 'followup' | 'referred' | 'closed'
export type AppointmentStatus = 'pending' | 'confirmed' | 'proposed' | 'declined' | 'cancelled' | 'completed'
export type SharedKind = 'emotion' | 'journal' | 'drawing' | 'voice' | 'image'
export interface DemoUser { id: string; role: Role; name: string; avatar: string; notifications: boolean; largeText: boolean; reducedMotion: boolean; highContrast: boolean; notificationTypes?: Record<string, boolean> }
export interface Student extends DemoUser { role: 'student'; grade: string; classroom: string; scenario: string; journalPrivate: boolean }
export interface Teacher extends DemoUser { role: 'teacher'; title: string; intro: string; training: string; methods: string[]; appointmentPreference?: string }
export interface Assignment { studentId: string; teacherId: string }
export interface CheckIn { id: string; studentId: string; date: string; emotions: string[]; intensity: number; topics: string[]; note: string; createdAt: string }
export interface JournalEntry { id: string; studentId: string; date: string; title: string; body: string; emotions: string[]; drawingIds: string[]; draft: boolean; createdAt: string }
export interface Drawing { id: string; studentId: string; title: string; src: string; createdAt: string }
export interface VoiceRecording { id: string; studentId: string; title: string; blob?: Blob; duration: number; simulated: boolean; createdAt: string }
export interface SharedItem { id: string; studentId: string; teacherId: string; kind: SharedKind; owner?: Role; sourceId?: string; label: string; text?: string; src?: string; createdAt: string; revoked?: boolean }
export type SharedDraft = Omit<SharedItem, 'id' | 'studentId' | 'teacherId' | 'createdAt'>
export interface SupportRequest { id: string; studentId: string; teacherId: string; preference: string; method: string; topic: string; message: string; emotions: string[]; sharedIds: string[]; status: RequestStatus; createdAt: string; acceptedAt?: string; closedAt?: string; conversationId?: string; events: JourneyEvent[] }
export interface JourneyEvent { id: string; title: string; detail?: string; date: string }
export interface Conversation { id: string; studentId: string; teacherId: string; requestId?: string; archivedBy: Role[]; createdAt: string }
export interface Message { id: string; conversationId: string; sender: Role; text: string; createdAt: string; read: boolean; sharedIds: string[] }
export interface Appointment { id: string; studentId: string; teacherId: string; requestId?: string; date: string; time: string; type: string; status: AppointmentStatus; requestedBy: Role; note: string; createdAt: string }
export interface AvailabilitySlot { id: string; day: number; time: string }
export interface TeacherAvailability { teacherId: string; available: boolean; weekdays: number[]; slots: AvailabilitySlot[]; responseTime: string }
export interface ActionItem { id: string; text: string; done: boolean }
export interface SupportPlan { id: string; requestId: string; studentId: string; teacherId: string; goal: string; actions: string[]; items: ActionItem[]; date: string; closed: boolean; createdAt: string }
export interface SupportNote { id: string; requestId: string; studentId: string; teacherId: string; text: string; followup: string; visibility: 'private' | 'student'; createdAt: string }
export interface FollowUp { id: string; requestId: string; studentId: string; teacherId: string; date: string; title: string; tasks: ActionItem[]; note: string; completed: boolean; createdAt: string }
export interface Referral { id: string; requestId: string; studentId: string; teacherId: string; destination: string; reason: string; fields: string[]; status: 'draft' | 'sent' | 'review' | 'closed'; date: string; createdAt: string }
export interface Feedback { id: string; requestId: string; followUpId?: string; studentId: string; teacherId: string; answers: Record<string, string>; text: string; createdAt: string }
export interface Notification { id: string; role: Role; recipientId: string; type: string; title: string; detail: string; href: string; read: boolean; createdAt: string }
export interface Concern { id: string; role: Role; conversationId?: string; reason: string; createdAt: string }
export interface DemoState {
  students: Student[]; teachers: Teacher[]; assignments: Assignment[]; checkIns: CheckIn[]; journals: JournalEntry[]; drawings: Drawing[]; voices: VoiceRecording[]; sharedItems: SharedItem[]; requests: SupportRequest[]; conversations: Conversation[]; messages: Message[]; appointments: Appointment[]; availability: TeacherAvailability[]; plans: SupportPlan[]; notes: SupportNote[]; followUps: FollowUp[]; referrals: Referral[]; feedback: Feedback[]; notifications: Notification[]; concerns: Concern[]; teacherId: string; revision: number
}
export type RequestDraft = Pick<SupportRequest, 'teacherId' | 'preference' | 'method'> & Partial<Pick<SupportRequest, 'topic' | 'message' | 'emotions'>> & { shared?: SharedDraft[] }
export type AppointmentDraft = Omit<Appointment, 'id' | 'createdAt' | 'status'>
export type NotificationDraft = Omit<Notification, 'id' | 'read' | 'createdAt'>
