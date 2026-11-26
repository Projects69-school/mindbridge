import type { DemoState, Student, Teacher } from '../types/demo'
import { offsetDate, STUDENT_ID, TEACHER_ID, weekday } from '../utils/demo'

export function createSeed(revision = 0): DemoState {
  const at = (days: number, time = '10:30') => `${offsetDate(days)}T${time}:00+07:00`
  const preferences = { notifications: true, largeText: false, reducedMotion: false, highContrast: false }
  const students: Student[] = [
    { ...preferences, id: STUDENT_ID, role: 'student', name: 'ฟ้า', avatar: '🌷', grade: 'มัธยมศึกษาปีที่ 5', classroom: 'ม.5/2', scenario: 'กังวลเรื่องการเรียนและอยากเริ่มขอความช่วยเหลือ', journalPrivate: true },
    { ...preferences, id: 'student-nam', role: 'student', name: 'น้ำ', avatar: '🌿', grade: 'มัธยมศึกษาปีที่ 4', classroom: 'ม.4/1', scenario: 'อยากให้ครูช่วยคิดวิธีคุยกับเพื่อน', journalPrivate: true },
    { ...preferences, id: 'student-win', role: 'student', name: 'วิน', avatar: '☀️', grade: 'มัธยมศึกษาปีที่ 5', classroom: 'ม.5/2', scenario: 'อยากจัดเวลาอ่านหนังสือให้พอดีกับเวลาพัก', journalPrivate: true },
    { ...preferences, id: 'student-pim', role: 'student', name: 'พิม', avatar: '🌼', grade: 'มัธยมศึกษาปีที่ 5', classroom: 'ม.5/1', scenario: 'อยากปรึกษาเรื่องกิจกรรมในห้องเรียน', journalPrivate: true },
  ]
  const teachers: Teacher[] = [
    { ...preferences, id: TEACHER_ID, role: 'teacher', name: 'ครูพลอย', avatar: '🌸', title: 'ครูแนะแนว', intro: 'ครูพร้อมฟังเรื่องเรียน ความสัมพันธ์ และเรื่องที่ยังไม่รู้ว่าจะเริ่มเล่าอย่างไร', training: 'การฟังเชิงลึกและการดูแลนักเรียน (สมมติ)', methods: ['ส่งข้อความ', 'นัดพบเป็นส่วนตัว'] },
    { ...preferences, id: 'teacher-may', role: 'teacher', name: 'ครูเมย์', avatar: '🌻', title: 'ครูประจำชั้น', intro: 'คุยกับครูได้ทั้งเรื่องในห้องเรียนและการปรับตัวกับเพื่อน', training: 'การสื่อสารกับวัยรุ่น (สมมติ)', methods: ['ส่งข้อความ', 'นัดโทรพูดคุย'] },
    { ...preferences, id: 'teacher-ton', role: 'teacher', name: 'ครูต้น', avatar: '🌱', title: 'ครูที่ปรึกษา', intro: 'ครูชวนวางแผนทีละนิด ในจังหวะที่เราพร้อม', training: 'ระบบดูแลช่วยเหลือนักเรียน (สมมติ)', methods: ['ส่งข้อความ', 'นัดพบเป็นส่วนตัว'] },
  ]
  const sampleDrawing = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><rect width="320" height="150" fill="#f4edff"/><path d="M0 125 Q 60 70 122 125 T 244 125 T 366 125 V150 H0" fill="#dbcaf5"/><path d="M160 88 C85 43 144 18 160 46 C177 18 235 43 160 88Z" fill="#b295de"/></svg>')
  return {
    revision, teacherId: TEACHER_ID, students, teachers,
    assignments: [{ studentId: STUDENT_ID, teacherId: TEACHER_ID }, { studentId: 'student-nam', teacherId: TEACHER_ID }, { studentId: 'student-win', teacherId: TEACHER_ID }, { studentId: 'student-pim', teacherId: 'teacher-may' }],
    checkIns: [
      { id: 'mood-1', studentId: STUDENT_ID, date: offsetDate(-1), emotions: ['กังวล', 'เหนื่อย'], intensity: 3, topics: ['การเรียน'], note: 'อยากแบ่งเวลาอ่านหนังสือให้ดีขึ้น', createdAt: at(-1) },
      { id: 'mood-2', studentId: STUDENT_ID, date: offsetDate(-2), emotions: ['มีความสุข'], intensity: 4, topics: ['เพื่อน'], note: 'ได้วาดรูปกับเพื่อนหลังเลิกเรียน', createdAt: at(-2) },
      { id: 'mood-3', studentId: STUDENT_ID, date: offsetDate(-3), emotions: ['เฉย ๆ'], intensity: 2, topics: [], note: '', createdAt: at(-3) },
      { id: 'mood-4', studentId: STUDENT_ID, date: offsetDate(-5), emotions: ['สบายใจ'], intensity: 4, topics: ['ครอบครัว'], note: '', createdAt: at(-5) },
      { id: 'mood-5', studentId: STUDENT_ID, date: offsetDate(-6), emotions: ['เครียด'], intensity: 3, topics: ['การสอบ'], note: '', createdAt: at(-6) },
      { id: 'mood-6', studentId: STUDENT_ID, date: offsetDate(-11), emotions: ['ตื่นเต้น'], intensity: 4, topics: ['เพื่อน'], note: '', createdAt: at(-11) },
    ],
    journals: [
      { id: 'journal-1', studentId: STUDENT_ID, date: offsetDate(-1), title: 'ค่อย ๆ ไปทีละเรื่อง', body: 'พอมีการบ้านหลายวิชาพร้อมกัน เราไม่รู้จะเริ่มตรงไหน พรุ่งนี้อยากลองเลือกแค่วิชาเดียวก่อน คืนนี้ขอพักโดยไม่รู้สึกผิด', emotions: ['กังวล', 'เหนื่อย'], drawingIds: [], draft: false, createdAt: at(-1) },
      { id: 'journal-2', studentId: STUDENT_ID, date: offsetDate(-4), title: 'ท้องฟ้าหลังเลิกเรียน', body: 'วันนี้ได้พักสักสิบนาทีแล้วรู้สึกหายใจโล่งขึ้น อยากลองเผื่อเวลาพักแบบนี้ก่อนเริ่มอ่านหนังสือ เป็นช่วงเงียบ ๆ ที่อยากเก็บให้ตัวเอง', emotions: ['สบายใจ'], drawingIds: ['drawing-1'], draft: false, createdAt: at(-4) },
    ],
    drawings: [{ id: 'drawing-1', studentId: STUDENT_ID, title: 'ท้องฟ้าสีลาเวนเดอร์', src: sampleDrawing, createdAt: at(-4) }],
    voices: [],
    sharedItems: [{ id: 'shared-1', studentId: STUDENT_ID, teacherId: TEACHER_ID, kind: 'journal', sourceId: 'journal-2', label: 'ข้อความที่ฟ้าเลือกแบ่งปัน', text: 'อยากลองเผื่อเวลาพักแบบนี้ก่อนเริ่มอ่านหนังสือ', createdAt: at(-3) }],
    requests: [
      { id: 'request-nam', studentId: 'student-nam', teacherId: TEACHER_ID, preference: 'อยากให้ช่วยคิดทางออก', method: 'ส่งข้อความ', topic: 'เพื่อน', message: 'อยากลองหาวิธีเริ่มคุยกับเพื่อนในกลุ่มค่ะ', emotions: [], sharedIds: [], status: 'new', createdAt: at(0, '09:10'), events: [{id:'event-nam', title:'ส่งคำขอแล้ว', date:at(0,'09:10')}] },
      { id: 'request-fah', studentId: STUDENT_ID, teacherId: TEACHER_ID, preference: 'อยากได้รับคำแนะนำ', method: 'ส่งข้อความ', topic: 'การเรียน', message: 'อยากลองหาวิธีจัดเวลาอ่านหนังสือค่ะ', emotions: ['กังวล'], sharedIds: ['shared-1'], status: 'followup', createdAt: at(-4), acceptedAt: at(-4, '13:45'), conversationId: 'chat-fah', events: [
        { id:'event-fah-1', title:'ส่งคำขอแล้ว', date:at(-4) }, { id:'event-fah-2', title:'ครูรับเรื่องแล้ว', date:at(-4,'13:45') }, { id:'event-fah-3', title:'ครูตอบกลับแล้ว', date:at(-3) }, { id:'event-fah-4', title:'นัดติดตามผล', date:at(-1) },
      ] },
      { id: 'request-win', studentId: 'student-win', teacherId: TEACHER_ID, preference: 'อยากให้มีคนรับฟัง', method: 'ส่งข้อความ', topic: 'การสอบ', message: 'อยากเล่าความรู้สึกก่อนสอบครับ', emotions: [], sharedIds: [], status: 'talking', createdAt: at(-7), acceptedAt: at(-7,'14:00'), conversationId: 'chat-win', events: [{id:'event-win', title:'กำลังพูดคุย', date:at(-7,'14:00')}] },
    ],
    conversations: [
      { id: 'chat-fah', studentId: STUDENT_ID, teacherId: TEACHER_ID, requestId: 'request-fah', archivedBy: [], createdAt: at(-4,'13:45') },
      { id: 'chat-win', studentId: 'student-win', teacherId: TEACHER_ID, requestId: 'request-win', archivedBy: [], createdAt: at(-7,'14:00') },
    ],
    messages: [
      { id: 'message-1', conversationId: 'chat-fah', sender: 'student', text: 'สวัสดีค่ะครูพลอย หนูอยากลองจัดเวลาอ่านหนังสือให้พอดีกับเวลาพักค่ะ', createdAt: at(-4,'14:10'), read: true, sharedIds: [] },
      { id: 'message-2', conversationId: 'chat-fah', sender: 'teacher', text: 'ขอบคุณที่ไว้ใจเล่าให้ครูฟังนะฟ้า เราค่อย ๆ ลองเลือกสิ่งที่ทำได้ทีละอย่างก็ได้', createdAt: at(-3,'10:15'), read: false, sharedIds: [] },
      { id: 'message-3', conversationId: 'chat-win', sender: 'student', text: 'ช่วงนี้พอใกล้สอบแล้วรู้สึกตื่นเต้นครับ', createdAt: at(-2,'15:05'), read: false, sharedIds: [] },
    ],
    appointments: [
      { id: 'appointment-fah', studentId: STUDENT_ID, teacherId: TEACHER_ID, requestId: 'request-fah', date: offsetDate(3), time: '13:00', type: 'พบครูเป็นส่วนตัว', status: 'confirmed', note: 'คุยเรื่องแบ่งเวลาเรียนและพัก', requestedBy: 'student', createdAt: at(-2) },
      { id: 'appointment-win', studentId: 'student-win', teacherId: TEACHER_ID, requestId: 'request-win', date: offsetDate(0), time: '15:30', type: 'สนทนาผ่านข้อความ', status: 'confirmed', note: '', requestedBy: 'teacher', createdAt: at(-1) },
    ],
    availability: teachers.map(teacher => {
      const weekdays = [...new Set([1,2,3,4,5,weekday(offsetDate(3))])]
      return { teacherId: teacher.id, available: true, weekdays, responseTime: teacher.id === TEACHER_ID ? 'ภายใน 1 วันเรียน' : 'ภายใน 2 วันเรียน', slots: weekdays.flatMap(day => ['10:30','13:00','14:00','15:30'].map(time => ({ id: `${teacher.id}-${day}-${time}`,day,time }))) }
    }),
    plans: [{ id:'plan-fah', requestId:'request-fah', studentId:STUDENT_ID, teacherId:TEACHER_ID, goal:'ลองจัดเวลาอ่านหนังสือและพักให้เหมาะกับตัวเอง', actions:['ร่วมกันวางแผน'], items:[{id:'task-plan-fah',text:'เลือกวิชาที่จะเริ่มอ่านก่อน',done:true},{id:'task-plan-fah-2',text:'ลองจดช่วงเวลาที่อยากพัก',done:false}], date:offsetDate(7), closed:false, createdAt:at(-2) }],
    notes: [{id:'note-fah', requestId:'request-fah', studentId:STUDENT_ID, teacherId:TEACHER_ID, text:'ชวนคุยเรื่องตารางเรียนในครั้งถัดไป',followup:'ทบทวนทางเลือกที่ฟ้าเสนอ',visibility:'private',createdAt:at(-1)}],
    followUps: [{id:'follow-fah', requestId:'request-fah', studentId:STUDENT_ID, teacherId:TEACHER_ID, title:'ทบทวนจังหวะเรียนและพัก',date:offsetDate(7),tasks:[{id:'task-fah',text:'คุยกันว่าวิธีไหนช่วยให้เริ่มอ่านง่ายขึ้น',done:false}],note:'ลองคุยถึงสิ่งที่ทำได้จริงในสัปดาห์นี้',completed:false,createdAt:at(-1)}],
    referrals: [], feedback: [], concerns: [],
    notifications: [
      {id:'notify-fah',role:'student',recipientId:STUDENT_ID,type:'message',title:'ครูพลอยส่งข้อความถึงเธอ',detail:'เปิดข้อความเมื่อพร้อมได้เลย',href:'/student/messages?id=chat-fah',read:false,createdAt:at(-3)},
      {id:'notify-ploy',role:'teacher',recipientId:TEACHER_ID,type:'request',title:'คำขอความช่วยเหลือใหม่',detail:'น้ำอยากให้ช่วยคิดทางออก',href:'/teacher/requests?id=request-nam',read:false,createdAt:at(0,'09:10')},
    ],
  }
}
