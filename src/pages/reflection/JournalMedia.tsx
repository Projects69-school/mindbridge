import { useEffect, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import { BookHeart, CalendarDays, Eraser, Eye, FileImage, Mic, NotebookPen, Palette, Pencil, Plus, Redo2, Save, Search, Share2, Square, Trash2, Undo2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui';
import { useDemo } from '../../context/DemoContext';
import type { Drawing as DrawingRecord, JournalEntry, VoiceRecording } from '../../types/demo';
import { id, now, STUDENT_ID } from '../../utils/demo';
import { clearReflectionTransfer, JournalNav, journalPrompts, localDate, moodOptions, PrivateBadge, readReflectionTransfer, ReflectionHeader, setReflectionTransfer, thaiDate, toggleChoice } from './common';
import { ShareReflection } from './Emotions';

const blankJournal = () => ({ title: '', body: '', date: localDate(), emotions: [] as string[], drawingIds: [] as string[] });

export function Journal() {
  const { state, actions, confirm, toast } = useDemo();
  const [entry, setEntry] = useState(() => {
    const transfer = readReflectionTransfer('journal', state.revision);
    const { title, body, date, emotions, drawingIds } = transfer?.journal ?? blankJournal();
    return { title, date, body: transfer?.body ?? body, emotions: transfer?.emotion ? [transfer.emotion, ...emotions] : emotions,
      drawingIds: transfer?.drawingId ? [...new Set([...drawingIds, transfer.drawingId])] : drawingIds };
  });
  const [extraMoods, setExtraMoods] = useState(() => entry.emotions.filter((name) => !moodOptions.some(([mood]) => name === mood)));
  const [editing, setEditing] = useState<JournalEntry | undefined>(() => state.journals.find((item) => item.id === readReflectionTransfer('journal', state.revision)?.journal?.editingId && item.studentId === STUDENT_ID));
  const [share, setShare] = useState<JournalEntry>();
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const [filter, setFilter] = useState('');
  const [drawingSelector, setDrawingSelector] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const entries = state.journals.filter((item) => item.studentId === STUDENT_ID).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const drawings = state.drawings.filter((drawing) => drawing.studentId === STUDENT_ID);
  const journalEmotions = [...new Set(entries.flatMap((item) => item.emotions))];
  const searchText = search.trim().toLocaleLowerCase('th');
  const filtered = entries.filter((item) => (!searchText || `${item.title} ${item.body}`.toLocaleLowerCase('th').includes(searchText)) &&
    (!date || item.date === date) && (!filter || item.emotions.includes(filter)));
  const monthDays = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  const moodChoices = [...moodOptions, ...extraMoods.map((name) => [name, '💭'])];
  useEffect(() => { clearReflectionTransfer('journal'); }, []);

  function reset() { setEditing(undefined); setEntry(blankJournal()); setExtraMoods([]); }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const draft = submitter?.getAttribute('value') === 'draft';
    if ((!entry.title.trim() && !draft) || (!entry.body.trim() && !entry.drawingIds.length && !draft)) {
      toast('เพิ่มชื่อเรื่องและข้อความหรือภาพวาดก่อนบันทึก');
      return;
    }
    if (!entry.title.trim() && !entry.body.trim() && !entry.drawingIds.length && !entry.emotions.length) { toast('เพิ่มสิ่งที่อยากเก็บไว้ก่อนบันทึก'); return; }
    const saved = { ...entry, title: entry.title.trim() || 'บันทึกที่ยังไม่ตั้งชื่อ', id: editing?.id ?? id(), studentId: STUDENT_ID, draft, createdAt: editing?.createdAt ?? now() };
    actions.update('journals', (previous) => editing ? previous.map((item) => item.id === editing.id ? saved : item) : [saved, ...previous]);
    toast(draft ? 'เก็บฉบับร่างไว้ในโหมดสาธิตแล้ว' : 'บันทึกส่วนตัวแล้ว');
    reset();
  }
  function edit(item: JournalEntry) {
    setEditing(item);
    setExtraMoods(item.emotions.filter((name) => !moodOptions.some(([mood]) => name === mood)));
    setEntry({ title: item.title, body: item.body, date: item.date, emotions: item.emotions, drawingIds: item.drawingIds });
  }
  async function remove(item: JournalEntry) {
    if (!await confirm({ title: 'ลบบันทึกส่วนตัวไหม?', message: 'บันทึกนี้จะหายจากสมุดของเธอ จัดการสำเนาที่เคยแชร์ได้ในหน้าตั้งค่า', label: 'ลบบันทึก' })) return;
    actions.update('journals', (previous) => previous.filter((record) => record.id !== item.id));
    if (editing?.id === item.id) reset();
    toast('ลบบันทึกแล้ว');
  }
  function insertPrompt(prompt: string) {
    setEntry((previous) => ({ ...previous, body: [previous.body, prompt].filter(Boolean).join('\n\n') + '\n' }));
    editorRef.current?.focus();
  }

  return <div className="rf-page">
    <ReflectionHeader area="พื้นที่ของฉัน" title="บันทึกส่วนตัว" description="เขียนถึงตัวเองในแบบที่เธอสบายใจ ทั้งข้อความ ความรู้สึก และภาพวาด" actions={<PrivateBadge />} />
    <JournalNav />
    <div className="rf-grid rf-grid-aside">
      <form className="rf-panel rf-form rf-journal" onSubmit={save}>
        <div className="rf-split"><div className="rf-title-icon"><span className="rf-icon" data-tone="pink"><NotebookPen /></span><h2>{editing ? 'แก้ไขบันทึก' : 'เปิดหน้ากระดาษใหม่'}</h2></div>{editing && <button type="button" className="rf-text-button" onClick={reset}><Plus size={17} />เขียนใหม่</button>}</div>
        <div className="rf-journal-fields">
          <label className="rf-field">ชื่อเรื่อง<input value={entry.title} onChange={(event) => setEntry({ ...entry, title: event.target.value })} placeholder="เช่น สิ่งที่อยากจำจากวันนี้" maxLength={100} /></label>
          <label className="rf-field">วันที่<input type="date" max={localDate()} value={entry.date} onChange={(event) => setEntry({ ...entry, date: event.target.value })} required /></label>
        </div>
        <label className="rf-field">สิ่งที่อยากบันทึก<textarea ref={editorRef} rows={8} value={entry.body} onChange={(event) => setEntry({ ...entry, body: event.target.value })} placeholder="เริ่มจากเรื่องเล็ก ๆ ที่อยากเล่าก็ได้…" maxLength={5000} /></label>
        <details className="rf-details"><summary>คำถามชวนเริ่มเขียน</summary><div className="rf-chips">{journalPrompts.map((prompt) => <button className="rf-chip" key={prompt} type="button" onClick={() => insertPrompt(prompt)}>{prompt}</button>)}</div></details>
        <fieldset className="rf-fieldset"><legend>สติกเกอร์ความรู้สึก</legend>
          <div className="rf-chips">{moodChoices.map(([name, emoji]) => <button className="rf-chip" key={name} type="button" aria-pressed={entry.emotions.includes(name)} onClick={() => setEntry({ ...entry, emotions: toggleChoice(entry.emotions, name) })}><span aria-hidden="true">{emoji}</span>{name}</button>)}</div>
        </fieldset>
        <div className="rf-actions"><button type="button" className="rf-text-button" onClick={() => setDrawingSelector(true)}><FileImage size={18} />แนบภาพวาด</button>
          <Link className="rf-text-button" to="/student/drawing" onClick={() => setReflectionTransfer('journal', { journal: { ...entry, editingId: editing?.id } }, state.revision)}><Palette size={18} />เปิดกระดานวาด</Link>
        </div>
        {entry.drawingIds.length > 0 && <div className="rf-attach-grid">{drawings.filter((drawing) => entry.drawingIds.includes(drawing.id)).map((drawing) => <div key={drawing.id}>
          <img src={drawing.src} alt={drawing.title} /><button type="button" className="rf-icon-button" aria-label="นำภาพออกจากบันทึก" onClick={() => setEntry({ ...entry, drawingIds: entry.drawingIds.filter((value) => value !== drawing.id) })}><X size={16} /></button>
        </div>)}</div>}
        <div className="rf-actions"><button className="rf-button" type="submit" value="save"><Save size={17} />บันทึกส่วนตัว</button><button className="rf-button rf-secondary" type="submit" value="draft">เก็บฉบับร่าง</button></div>
      </form>
      <section className="rf-panel rf-history">
        <div className="rf-title-icon"><span className="rf-icon" data-tone="lavender"><BookHeart /></span><h2>สมุดของฉัน</h2></div>
        <label className="rf-field"><span><Search size={15} />ค้นหาบันทึก</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นจากชื่อเรื่องหรือข้อความ" /></label>
        <div className="rf-journal-fields"><label className="rf-field">วันที่<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label className="rf-field">ความรู้สึก<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">ทั้งหมด</option>{journalEmotions.map((name) => <option key={name}>{name}</option>)}</select></label>
        </div>
        <details className="rf-details"><summary><CalendarDays size={16} />ปฏิทินบันทึก</summary>
          <label className="rf-field">เลือกเดือน<input type="month" value={month} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} /></label>
          <div className="rf-calendar">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day) => <strong key={day}>{day}</strong>)}
            {Array.from({ length: new Date(`${month}-01T12:00:00Z`).getUTCDay() }, (_, index) => <span key={index} />)}
            {Array.from({ length: monthDays }, (_, index) => {
              const day = `${month}-${String(index + 1).padStart(2, '0')}`;
              return <button type="button" key={day} aria-label={thaiDate(day)} aria-pressed={date === day} disabled={!entries.some((item) => item.date === day)} onClick={() => setDate(day === date ? '' : day)}>{index + 1}</button>;
            })}
          </div>
        </details>
        {filtered.length ? filtered.map((item) => <article className="rf-history-row rf-journal-record" key={item.id}>
          <div><p className="rf-smaller">{thaiDate(item.date)}{item.draft ? ' · ฉบับร่าง' : ''}</p><strong>{item.title}</strong><p className="rf-smaller">{item.emotions.join(' · ')}</p></div>
          <div className="rf-inline-actions">
            <button type="button" className="rf-icon-button" aria-label="แก้ไขบันทึก" onClick={() => edit(item)}><Pencil size={16} /></button>
            <button type="button" className="rf-icon-button" aria-label="เลือกข้อความจากบันทึกเพื่อแชร์" disabled={!item.body.trim()} onClick={() => setShare(item)}><Share2 size={16} /></button>
            <button type="button" className="rf-icon-button" aria-label="ลบบันทึก" onClick={() => void remove(item)}><Trash2 size={16} /></button>
          </div>
        </article>) : <p>ไม่มีบันทึกที่ตรงกับตัวกรอง เธอเขียนบันทึกใหม่ได้เมื่อพร้อม</p>}
      </section>
    </div>
    {share && <JournalShare entry={share} onClose={() => setShare(undefined)} />}
    {drawingSelector && <Modal title="เลือกภาพวาดแนบในบันทึก" onClose={() => setDrawingSelector(false)}>
      <div className="rf-form">{drawings.length ? <div className="rf-attach-grid">{drawings.map((drawing) => <button type="button" key={drawing.id} className="rf-choice" aria-pressed={entry.drawingIds.includes(drawing.id)} onClick={() => setEntry({ ...entry, drawingIds: toggleChoice(entry.drawingIds, drawing.id) })}><img src={drawing.src} alt="" />{drawing.title}</button>)}</div> :
        <p>เมื่อบันทึกภาพจากกระดานวาดแล้ว เธอจะเลือกภาพได้ที่นี่</p>}
        <button className="rf-button" type="button" onClick={() => setDrawingSelector(false)}>เสร็จแล้ว</button>
      </div>
    </Modal>}
  </div>;
}

function JournalShare({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const [excerpt, setExcerpt] = useState('');
  const [review, setReview] = useState(false);
  const source = useRef<HTMLTextAreaElement>(null);
  if (review) return <ShareReflection title="ข้อความบางส่วนจากบันทึก" draft={{ kind: 'journal', sourceId: entry.id, label: 'ข้อความบางส่วนจากบันทึก', text: excerpt.trim() }} onClose={onClose} onBack={() => setReview(false)} />;
  return <Modal title="เลือกบางส่วนเพื่อแชร์" onClose={onClose}>
    <div className="rf-form">
      <p>ลากเลือกเฉพาะช่วงที่อยากให้ครูเห็น แล้วกดเพิ่มข้อความที่เลือก เพื่อตรวจอีกครั้งก่อนส่ง</p>
      <label className="rf-field">ข้อความในบันทึก<textarea ref={source} rows={4} value={entry.body} readOnly /></label>
      <button className="rf-button rf-secondary" type="button" onClick={() => {
        const field = source.current;
        if (!field) return;
        const text = field.value.slice(field.selectionStart, field.selectionEnd);
        if (text) setExcerpt([excerpt, text].filter(Boolean).join('\n').slice(0, 5000));
      }}>เพิ่มข้อความที่เลือก</button>
      <label className="rf-field">ข้อความที่จะส่งให้ครู<textarea rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="วางหรือพิมพ์เฉพาะส่วนที่พร้อมแชร์" maxLength={5000} /></label>
      <button className="rf-button" type="button" disabled={!excerpt.trim()} onClick={() => setReview(true)}>ตรวจทานก่อนแชร์</button>
    </div>
  </Modal>;
}

const canvasWidth = 900;
const canvasHeight = 500;
const palette = [
  { name: 'ม่วง', color: '#9B87D4' }, { name: 'ชมพู', color: '#DB83AC' }, { name: 'เขียว', color: '#68A78E' },
  { name: 'ฟ้า', color: '#7C9DD7' }, { name: 'เหลือง', color: '#DFC26B' }, { name: 'เทาเข้ม', color: '#544A66' },
];
type Point = { x: number; y: number };
type Stroke = { color: string; width: number; erase: boolean; points: Point[] };

function drawStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
  const { points, color, width, erase } = stroke;
  if (!points.length) return;
  context.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  if (points.length === 1) {
    context.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  context.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) context.lineTo(point.x, point.y);
  context.stroke();
}

export function Drawing() {
  const { state, actions, confirm, toast } = useDemo();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draft = useRef<Stroke | undefined>(undefined);
  const pointer = useRef<number | undefined>(undefined);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [position, setPosition] = useState(0);
  const strokes = history[position];
  const [color, setColor] = useState(palette[0].color);
  const [width, setWidth] = useState(8);
  const [erase, setErase] = useState(false);
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState<string>();
  const [share, setShare] = useState<DrawingRecord>();
  const drawings = state.drawings.filter((drawing) => drawing.studentId === STUDENT_ID).slice().reverse();

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: canvasWidth * (event.clientX - rect.left) / rect.width, y: canvasHeight * (event.clientY - rect.top) / rect.height };
  }
  function paint(all: Stroke[], active?: Stroke) {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const stroke of all) drawStroke(context, stroke);
    if (active) drawStroke(context, active);
    context.globalCompositeOperation = 'source-over';
  }
  function end(event: PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== event.pointerId || !draft.current) return;
    const updated = [...strokes, draft.current];
    pointer.current = undefined;
    draft.current = undefined;
    commitDrawing(updated);
  }
  function commitDrawing(updated: Stroke[]) {
    setHistory([...history.slice(0, position + 1), updated]);
    setPosition(position + 1);
    paint(updated);
  }
  function goToDrawing(newPosition: number) {
    if (history[newPosition] === undefined) return;
    setPosition(newPosition);
    paint(history[newPosition]);
  }
  function save(attach = false) {
    if (!strokes.length || !canvasRef.current) return;
    const drawing: DrawingRecord = { id: id(), title: title.trim() || 'ภาพวาดความรู้สึก', src: canvasRef.current.toDataURL('image/png'), studentId: STUDENT_ID, createdAt: now() };
    actions.update('drawings', (previous) => [...previous, drawing]);
    toast('เก็บภาพวาดไว้ในโหมดสาธิตแล้ว');
    if (attach) attachToJournal(drawing);
    setTitle('');
  }
  function attachToJournal(drawing: DrawingRecord) {
    setReflectionTransfer('journal', { ...readReflectionTransfer('journal', state.revision), drawingId: drawing.id }, state.revision);
    navigate('/student/journal');
  }
  async function remove(drawing: DrawingRecord) {
    if (!await confirm({ title: 'ลบภาพวาดไหม?', message: 'ภาพจะถูกนำออกจากคลังและบันทึกส่วนตัวของเธอ สำเนาที่เธอแชร์ไว้จัดการได้ในหน้าตั้งค่า', label: 'ลบภาพวาด' })) return;
    actions.update('drawings', (previous) => previous.filter((item) => item.id !== drawing.id));
    actions.update('journals', (previous) => previous.map((item) => ({ ...item, drawingIds: item.drawingIds.filter((value) => value !== drawing.id) })));
    toast('ลบภาพวาดแล้ว');
  }

  return <div className="rf-page">
    <ReflectionHeader area="พื้นที่ของฉัน" title="วาดความรู้สึก" description="ใช้สี เส้น หรือรูปทรงระบายความรู้สึกตามใจเธอ" actions={<PrivateBadge />} />
    <JournalNav />
    <div className="rf-grid rf-grid-aside">
      <section className="rf-panel rf-form">
        <div className="rf-title-icon"><span className="rf-icon" data-tone="pink"><Palette /></span><h2>กระดานวาดของฉัน</h2></div>
        <div className="rf-draw-toolbar">
          <div className="rf-swatches" aria-label="สีแปรง">{palette.map((swatch) => <button className="rf-swatch" type="button" style={{ background: swatch.color }} key={swatch.name} aria-label={swatch.name} aria-pressed={!erase && color === swatch.color} onClick={() => { setColor(swatch.color); setErase(false); }} />)}</div>
          <label className="rf-brush">ขนาดแปรง<input type="range" min={2} max={34} value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label>
          <div className="rf-inline-actions">
            <button type="button" className="rf-icon-button" aria-label="ยางลบ" title="ยางลบ" aria-pressed={erase} onClick={() => setErase(!erase)}><Eraser size={18} /></button>
            <button type="button" className="rf-icon-button" aria-label="เลิกทำ" title="เลิกทำ" disabled={position === 0} onClick={() => goToDrawing(position - 1)}><Undo2 size={18} /></button>
            <button type="button" className="rf-icon-button" aria-label="ทำซ้ำ" title="ทำซ้ำ" disabled={position + 1 >= history.length} onClick={() => goToDrawing(position + 1)}><Redo2 size={18} /></button>
          </div>
        </div>
        <div className="rf-canvas-wrap">
          <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} aria-label="กระดานวาดความรู้สึก ใช้นิ้วหรือเมาส์ลากเพื่อวาด" 
            onPointerDown={(event) => {
              if (pointer.current !== undefined || event.button !== 0) return;
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              pointer.current = event.pointerId;
              draft.current = { color, width, erase, points: [point(event)] };
              paint(strokes, draft.current);
            }}
            onPointerMove={(event) => {
              if (pointer.current !== event.pointerId || !draft.current) return;
              draft.current.points.push(point(event));
              paint(strokes, draft.current);
            }} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} />
        </div>
        <div className="rf-actions">
          <button type="button" className="rf-text-button" disabled={!strokes.length} onClick={() => setPreview(canvasRef.current?.toDataURL('image/png'))}><Eye size={17} />ดูตัวอย่าง</button>
          <button type="button" className="rf-text-button" disabled={!strokes.length} onClick={async () => {
            if (!await confirm({ title: 'ล้างกระดานวาดไหม?', message: 'ภาพที่บันทึกไว้ในคลังจะยังเปิดดูได้', label: 'ล้างกระดาน' })) return;
            commitDrawing([]);
          }}><Trash2 size={17} />ล้างกระดาน</button>
        </div>
        <label className="rf-field">ชื่อภาพ <small>ไม่บังคับ</small><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="เช่น สีของวันนี้" maxLength={80} /></label>
        <div className="rf-actions"><button type="button" className="rf-button" disabled={!strokes.length} onClick={() => save()}><Save size={17} />เก็บภาพวาด</button>
          <button type="button" className="rf-button rf-secondary" disabled={!strokes.length} onClick={() => save(true)}><NotebookPen size={17} />เก็บและแนบในบันทึก</button>
        </div>
      </section>
      <section className="rf-panel rf-history">
        <span className="rf-icon" data-tone="mint"><FileImage /></span><h2>ภาพที่เก็บไว้</h2>
        {drawings.length > 0 ? <div className="rf-drawing-saved">{drawings.map((drawing) => <article key={drawing.id}>
          <button type="button" className="rf-drawing-thumb" onClick={() => setPreview(drawing.src)}><img src={drawing.src} alt={drawing.title} /></button>
          <div className="rf-split"><strong>{drawing.title}</strong><small>{thaiDate(drawing.createdAt)}</small></div>
          <div className="rf-inline-actions">
            <button className="rf-icon-button" type="button" aria-label="แนบภาพในบันทึก" onClick={() => attachToJournal(drawing)}><NotebookPen size={16} /></button>
            <button className="rf-icon-button" type="button" aria-label="แชร์ภาพวาดกับครู" onClick={() => setShare(drawing)}><Share2 size={16} /></button>
            <button className="rf-icon-button" type="button" aria-label="ลบภาพวาด" onClick={() => void remove(drawing)}><Trash2 size={16} /></button>
          </div>
        </article>)}</div> : <p>ภาพที่เธอเลือกเก็บจะปรากฏตรงนี้</p>}
        <p className="rf-note">ภาพถูกเก็บไว้เฉพาะในเบราว์เซอร์ระหว่างการสาธิต แชร์ได้เมื่อเธอเลือกผู้รับและยืนยัน</p>
      </section>
    </div>
    {preview && <Modal title="ตัวอย่างภาพวาด" onClose={() => setPreview(undefined)}><img className="rf-preview-img" src={preview} alt="ภาพวาดที่เธอเลือกดู" /></Modal>}
    {share && <ShareReflection title="ภาพวาดที่เลือก" draft={{ kind: 'drawing', sourceId: share.id, label: 'ภาพวาดที่เลือก', src: share.src }} onClose={() => setShare(undefined)} />}
  </div>;
}

export const simulatedVoiceUrl = `${import.meta.env.BASE_URL}assets/voice-example.wav`;
const transcript = 'ช่วงนี้หนูรู้สึกกังวลเรื่องการสอบ อยากมีคนช่วยรับฟังหน่อยค่ะ';

function AudioClip({ recording }: { recording: VoiceRecording }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!recording.blob) return;
    const href = URL.createObjectURL(recording.blob);
    setUrl(href);
    return () => URL.revokeObjectURL(href);
  }, [recording.blob]);
  const source = recording.simulated ? simulatedVoiceUrl : url;
  return source ? <audio controls preload="metadata" src={source} aria-label={recording.title} /> : null;
}

export function Voice() {
  const { state, actions, confirm, toast } = useDemo();
  const [status, setStatus] = useState<'idle' | 'asking' | 'recording'>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | undefined>(undefined);
  const stream = useRef<MediaStream | undefined>(undefined);
  const started = useRef(0);
  const captureAttempt = useRef(0);
  const active = useRef(false);
  const voices = state.voices.filter((item) => item.studentId === STUDENT_ID).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  useEffect(() => {
    if (status !== 'recording') return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      setDuration(elapsed);
      if (elapsed >= 60 && recorder.current?.state === 'recording') recorder.current.stop();
    }, 250);
    return () => window.clearInterval(timer);
  }, [status]);
  async function start() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('เบราว์เซอร์นี้เปิดไมโครโฟนไม่ได้ ลองใช้เสียงตัวอย่างด้านล่าง');
      return;
    }
    const attempt = ++captureAttempt.current;
    setStatus('asking');
    let audioStream: MediaStream | undefined;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current || attempt !== captureAttempt.current) { audioStream.getTracks().forEach((track) => track.stop()); return; }
      stream.current = audioStream;
      const recording = new MediaRecorder(audioStream);
      recorder.current = recording;
      const parts: BlobPart[] = [];
      let failed = false;
      recording.ondataavailable = (event) => { if (event.data.size > 0) parts.push(event.data); };
      recording.onerror = () => { failed = true; setError('บันทึกเสียงไม่สำเร็จ ลองใช้ตัวอย่างเสียงแทนได้'); };
      recording.onstop = () => {
        audioStream?.getTracks().forEach((track) => track.stop());
        if (!active.current) return;
        setStatus('idle');
        if (failed || !parts.length) return;
        const record: VoiceRecording = { id: id(), studentId: STUDENT_ID, title: 'เสียงบันทึกของฉัน', blob: new Blob(parts, { type: recording.mimeType || 'audio/webm' }), duration: Math.max(1, Math.round((Date.now() - started.current) / 1000)), simulated: false, createdAt: now() };
        actions.update('voices', (previous) => [record, ...previous]);
        toast('บันทึกเสียงไว้ชั่วคราวแล้ว');
      };
      started.current = Date.now();
      setDuration(0);
      recording.start();
      setStatus('recording');
    } catch {
      audioStream?.getTracks().forEach((track) => track.stop());
      if (!active.current || attempt !== captureAttempt.current) return;
      setError('เปิดไมโครโฟนไม่ได้ ลองอนุญาตในเบราว์เซอร์ หรือใช้เสียงตัวอย่าง');
      setStatus('idle');
    }
  }

  function cancelPermission() {
    captureAttempt.current += 1;
    setStatus('idle');
  }

  function addSimulated() {
    if (status === 'asking') cancelPermission();
    const record: VoiceRecording = { id: id(), studentId: STUDENT_ID, title: 'บันทึกเสียงสมมติ', duration: 5, simulated: true, createdAt: now() };
    actions.update('voices', (previous) => [record, ...previous]);
    toast('เพิ่มเสียงสาธิตแล้ว');
  }

  return <div className="rf-page">
    <ReflectionHeader area="พื้นที่ของฉัน" title="บันทึกเสียงชั่วคราว" description="ลองพูดออกมาให้ตัวเองฟัง และเลือกเก็บหรือลบเสียงได้ตามต้องการ" actions={<PrivateBadge />} />
    <JournalNav />
    <div className="rf-grid">
      <section className="rf-panel rf-voice-stage">
        <div className="rf-mic" data-recording={status === 'recording'}><Mic size={40} /></div>
        <h2>{status === 'recording' ? 'กำลังบันทึกเสียง' : status === 'asking' ? 'กำลังขออนุญาตใช้ไมโครโฟน' : 'อัดเสียงเมื่อพร้อม'}</h2>
        <p>{status === 'recording' ? `บันทึกแล้ว ${duration} วินาที จาก 60 วินาที` : 'ใช้เรื่องราวสมมติ ความยาวสูงสุด 1 นาทีต่อครั้ง'}</p>
        {status === 'recording' ? <button type="button" className="rf-button" onClick={() => recorder.current?.state === 'recording' && recorder.current.stop()}><Square size={16} />หยุดบันทึก</button> :
          <button type="button" className="rf-button" disabled={status === 'asking'} onClick={() => void start()}><Mic size={17} />เริ่มบันทึกเสียง</button>}
        {status === 'asking' && <button type="button" className="rf-text-button" onClick={cancelPermission}>ยกเลิกการขอใช้ไมโครโฟน</button>}
        <p className="rf-note" role="status">{error || 'ไมโครโฟนจะเริ่มทำงานเมื่อเธอกดเริ่มและอนุญาตผ่านเบราว์เซอร์เท่านั้น'}</p>
        <button type="button" className="rf-button rf-secondary" onClick={addSimulated}>ใช้ตัวอย่างเสียงสาธิต</button>
      </section>
      <section className="rf-panel rf-history"><h2>เสียงที่เก็บไว้</h2>
        {voices.length > 0 ? voices.map((recording) => <article className="rf-voice-record" key={recording.id}>
          <div className="rf-split"><div><strong>{recording.title}</strong><p className="rf-smaller">{recording.duration} วินาที · {thaiDate(recording.createdAt)}</p></div>
            <button type="button" className="rf-icon-button" aria-label="ลบบันทึกเสียง" onClick={async () => {
              if (!await confirm({ title: 'ลบบันทึกเสียงนี้ไหม?', message: 'เสียงจะหายจากรายการส่วนตัวของเธอในโหมดสาธิต', label: 'ลบเสียง' })) return;
              actions.update('voices', (previous) => previous.filter((item) => item.id !== recording.id));
              toast('ลบบันทึกเสียงแล้ว');
            }}><Trash2 size={17} /></button>
          </div>
          {recording.simulated && <p className="rf-note">เสียงประกอบสำหรับทดสอบการเล่น ตัวอย่างข้อความสมมติ “{transcript}”</p>}
          <AudioClip recording={recording} />
        </article>) : <p>เมื่อหยุดบันทึก เธอฟังเสียงย้อนหลังหรือลบทิ้งได้ที่นี่</p>}
      </section>
    </div>
  </div>;
}
