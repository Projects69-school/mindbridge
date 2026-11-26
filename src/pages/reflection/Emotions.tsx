import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, Check, ChevronRight, Compass, Heart, History, LockKeyhole, Pencil, Plus, Share2, Trash2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '../../components/ui';
import { useDemo } from '../../context/DemoContext';
import type { CheckIn as CheckInRecord, SharedDraft } from '../../types/demo';
import { id, now, offsetDate, STUDENT_ID } from '../../utils/demo';
import { clearReflectionTransfer, EmotionNav, localDate, moodOptions, moodTopics, PrivateBadge, readReflectionTransfer, ReflectionHeader, setReflectionTransfer, thaiDate, toggleChoice } from './common';

const mouths = ['M13 23Q20 35 27 23Z', 'M14 24Q20 31 26 24', 'M14 23Q20 34 26 23Z', 'M16 25h8', 'M16 27q4-4 8 0', 'M14 25q3-4 6 0t6 0', 'M14 28q6-8 12 0', 'M15 28q5-7 10 0', 'M15 27q5-6 10 0', 'M17 25q3-2 6 0', 'M15 28q5-7 10 0', 'M15 27q5-3 10 0', 'M17 26q3 2 6-1'];

function MoodFace({ mood }: { mood: string }) {
  const index = moodOptions.findIndex(([name]) => name === mood);
  const color = moodOptions[index]?.[2] ?? '#eee5fa';
  return <span className="rf-mood-face" style={{ background: color }} aria-hidden="true" title={mood}>
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="10" cy="23" r="2.5" fill="#e9a6b4" opacity=".66" /><circle cx="30" cy="23" r="2.5" fill="#e9a6b4" opacity=".66" />
      <g stroke="#5e4b72" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {index === 1 || index === 4 ? <path d="M11 17q3 3 6 0m6 0q3 3 6 0" /> : <><circle cx="14" cy="17" r="1.1" /><circle cx="26" cy="17" r="1.1" /></>}
        {index === 8 && <path d="m10 12 6 3m14-3-6 3" />}
        {index === 7 && <path d="m11 13 5-2m13 2-5-2" />}
        <path d={mouths[index] ?? mouths[12]} />
      </g>
      {index === 10 && <path d="M28 20c5 7 1 10-1 7-1-2 0-4 1-7Z" fill="#8da8df" />}
    </svg>
  </span>;
}

export function ShareReflection({ title, draft, onClose, onBack }: { title: string; draft: SharedDraft; onClose: () => void; onBack?: () => void }) {
  const { state, actions, toast } = useDemo();
  const [teacherId, setTeacherId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const teachers = state.teachers;
  return <Modal title="ตรวจทานก่อนแชร์" onClose={onClose}>
    <form className="rf-form" onSubmit={(event) => {
      event.preventDefault();
      if (!confirmed || !teachers.some((teacher) => teacher.id === teacherId)) return;
      actions.share(teacherId, draft);
      toast('แชร์สำเนาที่เธอเลือกให้ครูแล้วในโหมดสาธิต');
      onClose();
    }}>
      <label className="rf-field">ผู้ที่จะได้รับข้อมูล<select value={teacherId} onChange={(event) => { setTeacherId(event.target.value); setConfirmed(false); }} required>
        <option value="">เลือกครูที่เธอไว้วางใจ</option>
        {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.title}</option>)}
      </select></label>
      <dl className="rf-summary">
        <div><dt>ข้อมูลที่จะส่ง</dt><dd>{title}</dd></div>
        {draft.text && <div><dt>ข้อความที่เลือก</dt><dd className="rf-preserve">{draft.text}</dd></div>}
        <div><dt>วัตถุประสงค์</dt><dd>ให้ครูเข้าใจเรื่องที่เธอพร้อมเล่าและช่วยดูแลตามที่ตกลงร่วมกัน</dd></div>
      </dl>
      {draft.src && <img className="rf-preview-img" src={draft.src} alt="ภาพวาดที่เลือกแชร์" />}
      <p className="rf-note">ครูที่เลือกจะเห็นเฉพาะสำเนานี้ เธอขอยกเลิกการเข้าถึงในภายหลังได้ ส่วนข้อมูลที่ครูเห็นไปแล้วจะเรียกคืนไม่ได้ หากมีเรื่องเกี่ยวกับความปลอดภัย ครูอาจต้องขอความช่วยเหลือตามแนวทางของโรงเรียน</p>
      <label className="rf-inline-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />ฉันตรวจทานและพร้อมแชร์ข้อมูลข้างต้น</label>
      <div className="rf-actions"><button className="rf-button" type="submit" disabled={!teacherId || !confirmed}>ยืนยันแชร์ในโหมดสาธิต</button><button className="rf-button rf-secondary" type="button" onClick={onBack ?? onClose}>กลับไปแก้ไข</button></div>
    </form>
  </Modal>;
}

export function CheckIn() {
  const { state, actions, toast, confirm } = useDemo();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<string[]>(() => {
    const shortcuts = params.getAll('emotion').filter((emotion) => moodOptions.some(([name]) => name === emotion));
    const transferred = readReflectionTransfer('emotions', state.revision)?.emotion;
    return transferred ? [...new Set([...shortcuts, transferred])] : shortcuts;
  });
  const [extra, setExtra] = useState(() => selected.filter((emotion) => !moodOptions.some(([name]) => name === emotion)));
  const [editing, setEditing] = useState<CheckInRecord>();
  const [intensity, setIntensity] = useState(3);
  const [date, setDate] = useState(localDate);
  const [topics, setTopics] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [share, setShare] = useState<CheckInRecord>();
  const records = state.checkIns.filter((record) => record.studentId === STUDENT_ID).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const choices = [...moodOptions.map(([name]) => name), ...extra];
  useEffect(() => { clearReflectionTransfer('emotions'); }, []);
  const reset = () => { setSelected([]); setExtra([]); setEditing(undefined); setIntensity(3); setDate(localDate()); setTopics([]); setNote(''); };
  function save(event: FormEvent) {
    event.preventDefault();
    if (!selected.length || !date) return;
    const record: CheckInRecord = { id: editing?.id ?? id(), studentId: STUDENT_ID, date, emotions: selected, intensity, topics, note: note.trim(), createdAt: editing?.createdAt ?? now() };
    actions.update('checkIns', (previous) => editing ? previous.map((item) => item.id === editing.id ? record : item) : [record, ...previous]);
    toast(editing ? 'แก้ไขเช็กอินแล้ว' : 'บันทึกเช็กอินแล้ว');
    reset();
  }
  function edit(record: CheckInRecord) {
    setEditing(record); setSelected(record.emotions);
    setExtra(record.emotions.filter((emotion) => !moodOptions.some(([name]) => name === emotion)));
    setIntensity(record.intensity); setTopics(record.topics); setNote(record.note); setDate(record.date);
  }
  async function remove(record: CheckInRecord) {
    if (!await confirm({ title: 'ลบเช็กอินนี้ไหม?', message: 'รายการนี้จะหายจากประวัติความรู้สึกของเธอในโหมดสาธิต', label: 'ลบเช็กอิน' })) return;
    actions.update('checkIns', (previous) => previous.filter((item) => item.id !== record.id));
    if (editing?.id === record.id) reset();
    toast('ลบเช็กอินแล้ว');
  }
  return <div className="rf-page">
    <ReflectionHeader area="อารมณ์ของฉัน" title="เช็กอินความรู้สึก" description="ค่อย ๆ สังเกตตัวเอง วันนี้รู้สึกได้มากกว่าหนึ่งอย่าง" actions={<PrivateBadge />} />
    <EmotionNav />
    <div className="rf-grid rf-grid-aside">
      <form className="rf-panel rf-form" onSubmit={save}>
        <div className="rf-split"><h2>{editing ? 'แก้ไขเช็กอิน' : 'วันนี้เธอรู้สึกอย่างไร?'}</h2><span className="rf-eyebrow">เลือกได้หลายคำ</span></div>
        <div className="rf-mood-grid">{choices.map((mood) => <button className="rf-mood" type="button" key={mood} onClick={() => setSelected(toggleChoice(selected, mood))} aria-pressed={selected.includes(mood)}><MoodFace mood={mood} /><span>{mood}</span></button>)}</div>
        <fieldset className="rf-fieldset">
          <legend>ความรู้สึกนี้ชัดแค่ไหน?</legend>
          <div className="rf-scale">{[1, 2, 3, 4, 5].map((value) => <label key={value}><input type="radio" name="intensity" checked={intensity === value} onChange={() => setIntensity(value)} /><span>{value}</span></label>)}</div>
          <div className="rf-split rf-smaller"><span>เล็กน้อย</span><span>ชัดมาก</span></div>
        </fieldset>
        <details className="rf-details"><summary>เลือกหัวข้อหรือเขียนเพิ่ม <small>ข้ามได้</small></summary>
          <div className="rf-chips">{moodTopics.map((topic) => <button className="rf-chip" type="button" key={topic} onClick={() => setTopics(toggleChoice(topics, topic))} aria-pressed={topics.includes(topic)}>{topic}</button>)}</div>
          <label className="rf-field">บันทึกสั้น ๆ<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="เขียนไว้ให้ตัวเองเท่าที่อยากเขียน" maxLength={2000} /></label>
          <label className="rf-field rf-date">วันที่<input type="date" max={localDate()} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        </details>
        <div className="rf-actions"><button className="rf-button" type="submit" disabled={!selected.length}><Check size={17} />{editing ? 'บันทึกการแก้ไข' : 'บันทึกเช็กอิน'}</button>
          {editing && <button className="rf-button rf-secondary" type="button" onClick={reset}>ยกเลิกการแก้ไข</button>}
          <Link className="rf-text-button" to="/student/emotion-decoder"><Compass size={17} />ช่วยหาคำเรียกความรู้สึก</Link>
        </div>
      </form>
      <section className="rf-panel rf-history">
        <div className="rf-split"><span className="rf-icon"><History /></span><Link className="rf-text-button" to="/student/mood-timeline">ดูทั้งหมด<ChevronRight size={16} /></Link></div>
        <h2>เช็กอินล่าสุด</h2>
        {records.length ? <div className="rf-check-history-list" aria-label="ประวัติเช็กอิน">{records.map((record) => <article key={record.id} className="rf-history-row">
          <div><p className="rf-smaller">{thaiDate(record.date)}</p><strong>{record.emotions.join(' · ')}</strong></div>
          <div className="rf-inline-actions">
            <button className="rf-icon-button" type="button" aria-label="แก้ไขเช็กอิน" onClick={() => edit(record)}><Pencil size={16} /></button>
            <button className="rf-icon-button" type="button" aria-label="เลือกความรู้สึกที่จะแชร์" onClick={() => setShare(record)}><Share2 size={16} /></button>
            <button className="rf-icon-button" type="button" aria-label="ลบเช็กอิน" onClick={() => void remove(record)}><Trash2 size={16} /></button>
          </div>
        </article>)}</div> : <p>เช็กอินครั้งแรกเมื่อเธอพร้อม แล้วรายการจะปรากฏที่นี่</p>}
        <p className="rf-note"><LockKeyhole size={16} />เช็กอินเก็บไว้เฉพาะเธอ และจะเริ่มใหม่เมื่อรีเฟรชหน้า</p>
      </section>
    </div>
    {share && <CheckInShare record={share} onClose={() => setShare(undefined)} />}
  </div>;
}

function CheckInShare({ record, onClose }: { record: CheckInRecord; onClose: () => void }) {
  const [emotions, setEmotions] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  if (review) return <ShareReflection title="ความรู้สึกที่เลือก" draft={{ kind: 'emotion', sourceId: record.id, label: 'ความรู้สึกที่เลือก', text: emotions.join(' · ') }} onClose={onClose} onBack={() => setReview(false)} />;
  return <Modal title="เลือกความรู้สึกที่จะแชร์" onClose={onClose}>
    <div className="rf-form"><p>เลือกเฉพาะคำที่อยากให้ครูเห็น รายละเอียดอื่นจะอยู่ในเช็กอินส่วนตัว</p>
      <div className="rf-chips">{record.emotions.map((emotion) => <button className="rf-chip" type="button" key={emotion} aria-pressed={emotions.includes(emotion)} onClick={() => setEmotions(toggleChoice(emotions, emotion))}>{emotion}</button>)}</div>
      <button type="button" className="rf-button" disabled={!emotions.length} onClick={() => setReview(true)}>ตรวจทานข้อมูล</button>
    </div>
  </Modal>;
}

const categories = [
  { name: 'ความสุข', color: '#fff0c4', icon: '☀', details: [['ดีใจ', 'รู้สึกอบอุ่นหรือมีพลังเมื่อมีเรื่องที่ชอบเกิดขึ้น'], ['ภูมิใจ', 'เห็นคุณค่าในสิ่งที่พยายามทำ'], ['ตื่นเต้น', 'รู้สึกมีพลังกับสิ่งที่กำลังจะเกิดขึ้น'], ['ซาบซึ้ง', 'รู้สึกขอบคุณกับสิ่งที่ได้รับ']] },
  { name: 'ความสงบ', color: '#e0f1e6', icon: '◌', details: [['สบายใจ', 'ใจได้พักและรู้สึกผ่อนคลาย'], ['โล่งใจ', 'รู้สึกเบาลงเมื่อเรื่องที่กังวลคลี่คลาย'], ['ปลอดภัย', 'รู้สึกว่าอยู่ในพื้นที่ที่เป็นตัวเองได้']] },
  { name: 'ความประหลาดใจ', color: '#f6deef', icon: '✧', details: [['แปลกใจ', 'เจอสิ่งที่ต่างจากที่คาดไว้'], ['สงสัย', 'อยากรู้เรื่องที่ยังเข้าใจไม่ครบ'], ['ทึ่ง', 'รู้สึกประทับใจกับสิ่งที่เกินคาด']] },
  { name: 'ความสับสน', color: '#f5e5dc', icon: '≋', details: [['ลังเล', 'ยังไม่แน่ใจว่าจะตัดสินใจทางไหน'], ['งง', 'รู้สึกว่ายังจับต้นชนปลายไม่ถูก'], ['ยังไม่แน่ใจ', 'รู้สึกหลายอย่างพร้อมกันหรือยังหาคำไม่เจอ']] },
  { name: 'ความกลัว', color: '#ddeafb', icon: '◒', details: [['กังวล', 'ใจวนคิดถึงสิ่งที่อาจเกิดขึ้น'], ['ไม่มั่นใจ', 'ยังไม่แน่ใจว่าจะรับมือไหวไหม'], ['ประหม่า', 'รู้สึกเกร็งเมื่อกำลังเจอสิ่งที่สำคัญ'], ['รู้สึกกดดัน', 'รู้สึกว่ามีความคาดหวังที่รับมือยาก']] },
  { name: 'ความเศร้า', color: '#e7def9', icon: '♧', details: [['เหงา', 'อยากรู้สึกเชื่อมโยงกับใครสักคน'], ['ผิดหวัง', 'สิ่งที่เกิดขึ้นต่างจากที่หวังไว้'], ['เสียใจ', 'เจ็บปวดกับการสูญเสียหรือเรื่องที่มีความหมาย'], ['รู้สึกถูกทอดทิ้ง', 'รู้สึกว่าไม่ได้รับการดูแลหรือความใส่ใจ'], ['ท้อแท้', 'รู้สึกว่าพลังใจที่จะลองต่อลดลง']] },
  { name: 'ความโกรธ', color: '#f7dedf', icon: 'ϟ', details: [['หงุดหงิด', 'รู้สึกติดขัดหรือรำคาญง่ายขึ้น'], ['ไม่พอใจ', 'รู้สึกว่าสิ่งที่เกิดขึ้นขัดกับสิ่งที่ต้องการ'], ['รู้สึกไม่เป็นธรรม', 'รู้สึกว่าถูกปฏิบัติอย่างไม่เท่าเทียม'], ['รู้สึกว่าไม่มีใครเข้าใจ', 'อยากให้ผู้อื่นรับรู้มุมมองและความรู้สึกของเรา']] },
];

const polar = (radius: number, angle: number) => [230 + radius * Math.cos(angle), 230 + radius * Math.sin(angle)];
function wheelPath(start: number, end: number) {
  const a = polar(212, start);
  const b = polar(212, end);
  const c = polar(61, end);
  const d = polar(61, start);
  return `M ${a.join(' ')} A 212 212 0 0 1 ${b.join(' ')} L ${c.join(' ')} A 61 61 0 0 0 ${d.join(' ')} Z`;
}

type EmotionDestination = 'emotions' | 'journal' | 'support';
export function EmotionDecoder() {
  const { state } = useDemo();
  const [current, setCurrent] = useState(4);
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const group = categories[current];
  const [emotion, meaning] = group.details[selected];
  function choose(index: number) { setCurrent(index); setSelected(0); }
  function transfer(destination: EmotionDestination) {
    if (destination === 'support') {
      navigate(`/student/support?mode=express&emotion=${encodeURIComponent(emotion)}`);
      return;
    }
    setReflectionTransfer(destination, { emotion }, state.revision);
    navigate(`/student/${destination}`);
  }
  return <div className="rf-page">
    <ReflectionHeader area="อารมณ์ของฉัน" title="Emotion Decoder — วงล้ออารมณ์" description="สำรวจคำที่อาจใกล้กับความรู้สึกของเธอ เลือกคำที่ใช่ในแบบของตัวเอง" />
    <EmotionNav />
    <section className="rf-panel rf-wheel-layout">
      <div className="rf-wheel-wrap">
        <svg className="rf-wheel" viewBox="0 0 460 460" aria-label="วงล้ออารมณ์เจ็ดกลุ่ม">
          <circle cx="230" cy="230" r="222" fill="#faf7ff" stroke="#eaddf4" />
          {categories.map((category, index) => {
            const center = index * (2 * Math.PI / categories.length) - Math.PI / 2;
            const half = Math.PI / categories.length - .015;
            const [x, y] = polar(140, center);
            return <g key={category.name} className="rf-wheel-sector" role="button" tabIndex={0} aria-label={category.name} aria-pressed={index === current} onClick={() => choose(index)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(index); } }}>
              <path d={wheelPath(center - half, center + half)} fill={category.color} stroke={index === current ? '#9674c7' : '#fff'} strokeWidth={index === current ? 3 : 2} />
              <text x={x} y={y - 3} className="rf-wheel-icon">{category.icon}</text><text x={x} y={y + 23}>{category.name}</text>
            </g>;
          })}
          <circle cx="230" cy="230" r="51" fill="#fff" stroke="#eaddf4"/>
          <path d="M230 249c-17-12-26-18-26-29 0-12 15-19 26-6 11-13 26-6 26 6 0 11-9 17-26 29z" fill="#ead9f6" stroke="#9d75c8" strokeWidth="2"/>
        </svg>
      </div>
      <div className="rf-wheel-detail">
        <div className="rf-split"><span className="rf-icon" style={{ background: group.color }}><Compass /></span><span className="rf-eyebrow">สำรวจคำเรียกความรู้สึก</span></div>
        <h2>{group.name}</h2>
        <div className="rf-chips" aria-label="คำที่เกี่ยวข้อง">{group.details.map(([label], index) => <button className="rf-chip" type="button" key={label} aria-pressed={index === selected} onClick={() => setSelected(index)}>{label}</button>)}</div>
        <div className="rf-definition" aria-live="polite"><h3>{emotion}</h3><p>{meaning}</p></div>
        <div className="rf-actions">
          <button className="rf-button" type="button" onClick={() => transfer('emotions')}><Plus size={17} />เพิ่มในเช็กอิน</button>
          <button className="rf-button rf-secondary" type="button" onClick={() => transfer('journal')}>เพิ่มในบันทึก</button>
          <button className="rf-button rf-secondary" type="button" onClick={() => transfer('support')}>เพิ่มในคำขอ</button>
        </div>
        <details className="rf-details"><summary>เลือกจากรายการ</summary><div className="rf-chips">{categories.map((category, index) => <button type="button" className="rf-chip" key={category.name} aria-pressed={index === current} onClick={() => choose(index)}>{category.name}</button>)}</div></details>
        <p className="rf-note">วงล้อนี้ช่วยหาคำอธิบายความรู้สึก เธอใช้คำอื่นหรือยังไม่เลือกคำก็ได้</p>
      </div>
    </section>
  </div>;
}

const calendarDays = Array.from({ length: 30 }, (_, index) => 29 - index);

export function MoodTimeline() {
  const { state } = useDemo();
  const [mood, setMood] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [selected, setSelected] = useState<CheckInRecord>();
  const [day, setDay] = useState('');
  const records = state.checkIns.filter((record) => record.studentId === STUDENT_ID).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const matching = records.filter((record) => (!mood || record.emotions.includes(mood)) && (!start || record.date >= start) && (!end || record.date <= end));
  const moods = [...new Set(records.flatMap((record) => record.emotions))].sort((a, b) => a.localeCompare(b, 'th'));
  const emotionCounts = moods.map((name) => [name, matching.filter((record) => record.emotions.includes(name)).length] as const).filter(([, count]) => count > 0);
  const maximum = Math.max(1, ...emotionCounts.map(([, count]) => count));
  const dayMatches = day ? matching.filter((record) => record.date === day) : matching;
  const dated = calendarDays.map((offset) => offsetDate(-offset));
  return <div className="rf-page">
    <ReflectionHeader area="อารมณ์ของฉัน" title="ประวัติความรู้สึก" description="เปิดดูสิ่งที่เธอเคยรู้สึกเมื่ออยากทบทวน แต่ละวันมีหลายความรู้สึกได้" actions={<PrivateBadge />} />
    <EmotionNav />
    <section className="rf-panel rf-week">
      <div className="rf-split"><h2>ความรู้สึก 7 วันที่ผ่านมา</h2><Heart size={19} /></div>
      <div className="rf-week-strip">{dated.slice(-7).map((date) => {
        const record = matching.find((item) => item.date === date);
        return <button key={date} className="rf-week-day" type="button" disabled={!record} onClick={() => setSelected(record)} aria-label={`${thaiDate(date)} ${record?.emotions.join(' ') ?? 'ยังไม่ได้เช็กอิน'}`}>
          <span>{thaiDate(date, { weekday: 'short' })}</span>{record ? <MoodFace mood={record.emotions[0]} /> : <span className="rf-empty-face">·</span>}<small>{thaiDate(date, { day: 'numeric' })}</small>
        </button>;
      })}</div>
    </section>
    <section className="rf-panel rf-filters">
      <label className="rf-field">วันที่เริ่มต้น<input type="date" value={start} max={end || undefined} onChange={(event) => { setStart(event.target.value); setDay(''); }} /></label>
      <label className="rf-field">วันที่สิ้นสุด<input type="date" value={end} min={start || undefined} onChange={(event) => { setEnd(event.target.value); setDay(''); }} /></label>
      <label className="rf-field">ความรู้สึก<select value={mood} onChange={(event) => { setMood(event.target.value); setDay(''); }}><option value="">ทุกความรู้สึก</option>{moods.map((name) => <option key={name}>{name}</option>)}</select></label>
      <button className="rf-button rf-secondary" type="button" onClick={() => { setStart(''); setEnd(''); setMood(''); setDay(''); }}>ล้างตัวกรอง</button>
    </section>
    <div className="rf-grid">
      <section className="rf-panel rf-form">
        <div className="rf-split"><h2>ปฏิทิน 30 วัน</h2><CalendarDays size={19} /></div>
        <div className="rf-calendar">
          {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((label) => <strong key={label}>{label}</strong>)}
          {Array.from({ length: new Date(`${dated[0]}T12:00:00Z`).getUTCDay() }, (_, index) => <span key={index} />)}
          {dated.map((date) => <button type="button" key={date} disabled={!matching.some((record) => record.date === date)} aria-label={thaiDate(date)} aria-pressed={day === date} onClick={() => setDay(day === date ? '' : date)}>
            {Number(date.slice(-2))}
          </button>)}
        </div>
      </section>
      <section className="rf-panel rf-form"><h2>คำที่ใช้บันทึกความรู้สึก</h2>
        <div className="rf-chart">{emotionCounts.length ? emotionCounts.map(([label, count], index) => <div className="rf-bar-row" key={label} tabIndex={0} aria-label={`${label} ${count} ครั้ง`} title={`${label} ${count} ครั้ง`}>
          <span>{label}</span><span className="rf-bar-track"><span style={{ width: `${100 * count / maximum}%`, background: ['#c7b0ec', '#b9dfca', '#ecc0d6', '#d1dff4'][index % 4] }} /></span><strong>{count}</strong>
        </div>) : <p>ยังไม่มีความรู้สึกที่ตรงกับช่วงเวลาหรือตัวกรองที่เลือก</p>}</div>
      </section>
    </div>
    <section className="rf-panel rf-history">
      <div className="rf-split"><h2>{day ? `เช็กอินวันที่ ${thaiDate(day)}` : 'รายการเช็กอิน'}</h2>{day && <button type="button" className="rf-text-button" onClick={() => setDay('')}>ดูทุกวันที่เลือก</button>}</div>
      {dayMatches.length ? dayMatches.map((record) => <button className="rf-history-row rf-history-button" key={record.id} type="button" onClick={() => setSelected(record)}>
        <span><span className="rf-smaller">{thaiDate(record.date)}</span><strong>{record.emotions.join(' · ')}</strong></span><ChevronRight size={17} />
      </button>) : <p>ยังไม่มีรายการที่ตรงกับตัวกรอง ลองเลือกตัวกรองอื่น หรือบันทึกความรู้สึกเมื่อพร้อม</p>}
    </section>
    {selected && <Modal title={`เช็กอินวันที่ ${thaiDate(selected.date)}`} onClose={() => setSelected(undefined)}>
      <dl className="rf-summary">
        <div><dt>ความรู้สึก</dt><dd>{selected.emotions.join(' · ')}</dd></div>
        <div><dt>ความชัดของความรู้สึก</dt><dd>{selected.intensity} จาก 5</dd></div>
        {selected.topics.length > 0 && <div><dt>หัวข้อ</dt><dd>{selected.topics.join(' · ')}</dd></div>}
        {selected.note && <div><dt>บันทึกสั้น ๆ</dt><dd className="rf-preserve">{selected.note}</dd></div>}
      </dl>
    </Modal>}
  </div>;
}
