import type { ReactNode } from 'react';
import { ArrowLeft, BookHeart, CircleHelp, Compass, Heart, History, LockKeyhole, Palette } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { JournalEntry } from '../../types/demo';
import { bangkokDate, formatDate } from '../../utils/demo';

export function ReflectionHeader({ area, title, description, actions }: {
  area: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return <header className="rf-page-header">
    <div><span className="rf-eyebrow">{area}</span><h1>{title}</h1><p>{description}</p></div>
    {actions && <div className="rf-actions">{actions}</div>}
  </header>;
}

export function EmotionNav() {
  const { pathname } = useLocation();
  const tabs = [
    { url: '/student/emotions', icon: Heart, title: 'เช็กอิน' },
    { url: '/student/emotion-decoder', icon: Compass, title: 'วงล้ออารมณ์' },
    { url: '/student/mood-timeline', icon: History, title: 'ประวัติความรู้สึก' },
    { url: '/student/wellbeing', icon: CircleHelp, title: 'สำรวจสุขภาวะทางใจ' },
  ];
  return <nav className="rf-tabs" aria-label="เมนูอารมณ์ของฉัน">{tabs.map(({ url, icon: Icon, title }) =>
    <Link key={url} to={url} aria-current={url === pathname ? 'page' : undefined}><Icon size={17} />{title}</Link>,
  )}</nav>;
}

export function JournalNav() {
  const { pathname } = useLocation();
  return <nav className="rf-tabs" aria-label="เมนูบันทึกส่วนตัว">
    <Link to="/student/journal" aria-current={pathname === '/student/journal' ? 'page' : undefined}><BookHeart size={17} />เขียนบันทึก</Link>
    <Link to="/student/drawing" aria-current={pathname === '/student/drawing' ? 'page' : undefined}><Palette size={17} />วาดความรู้สึก</Link>
    <Link to="/student/voice" aria-current={pathname === '/student/voice' ? 'page' : undefined}><Heart size={17} />บันทึกเสียง</Link>
  </nav>;
}

export function PrivateBadge() {
  return <span className="rf-private"><LockKeyhole size={15} />ส่วนตัว</span>;
}

export function BackToStudent() {
  return <Link className="rf-button rf-secondary" to="/student/dashboard"><ArrowLeft size={17} />กลับหน้าหลัก</Link>;
}

export const moodOptions = [
  ['มีความสุข', '😊', '#fff0cc'], ['สบายใจ', '😌', '#dff0e8'], ['ตื่นเต้น', '🤩', '#f6e3ec'],
  ['เฉย ๆ', '😐', '#ece7f5'], ['เหนื่อย', '😮‍💨', '#e5e7f5'], ['สับสน', '😵‍💫', '#f8eadb'],
  ['เครียด', '😣', '#eee3f8'], ['กังวล', '😟', '#e0eaf8'], ['โกรธ', '😠', '#f7dce8'],
  ['เหงา', '🥺', '#e2e9fa'], ['เศร้า', '😢', '#e4e9fc'], ['รู้สึกหนักใจ', '😔', '#e9e4f4'],
  ['ยังไม่แน่ใจ', '💭', '#f0edf7'],
] as const;

export const moodTopics = ['การเรียน', 'การสอบ', 'ครอบครัว', 'เพื่อน', 'ความสัมพันธ์', 'การถูกกลั่นแกล้ง', 'ความคาดหวัง', 'ความมั่นใจ', 'สุขภาพ', 'อนาคต', 'อื่น ๆ', 'ยังไม่พร้อมระบุ'];

export const journalPrompts = ['วันนี้เกิดอะไรขึ้นบ้าง?', 'ตอนนี้เธอกำลังรู้สึกอย่างไร?', 'มีอะไรที่อยากให้คนอื่นเข้าใจไหม?', 'ตอนนี้เธอต้องการอะไร?', 'มีเรื่องอะไรที่อยากระบายไหม?'];

export { bangkokDate as localDate };

export const thaiDate = (input: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => formatDate(input, options);

export function toggleChoice(values: string[], value: string) {
  return values.includes(value) ? values.filter((option) => option !== value) : [...values, value];
}

type JournalEditor = Pick<JournalEntry, 'title' | 'body' | 'date' | 'emotions' | 'drawingIds'> & { editingId?: string };
type ReflectionTransfer = { emotion?: string; body?: string; drawingId?: string; journal?: JournalEditor };
type TransferDestination = 'emotions' | 'journal';
const transfers = new Map<TransferDestination, { transfer: ReflectionTransfer; revision: number }>();

export function setReflectionTransfer(destination: TransferDestination, transfer: ReflectionTransfer, revision: number) {
  transfers.set(destination, { transfer, revision });
}

export function readReflectionTransfer(destination: TransferDestination, revision: number) {
  const entry = transfers.get(destination);
  return entry?.revision === revision ? entry.transfer : undefined;
}

export function clearReflectionTransfer(destination: TransferDestination) {
  transfers.delete(destination);
}
