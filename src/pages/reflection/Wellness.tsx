import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookHeart, Brain, Clock3, Flower2, GraduationCap, HandHeart, Heart, Headphones, Moon, Phone, ShieldAlert, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';
import { BackToStudent, EmotionNav, ReflectionHeader, setReflectionTransfer } from './common';

const questions = [
  ['การเรียน', 'ช่วงนี้เธอรู้สึกกดดันกับการเรียนบ่อยแค่ไหน?'],
  ['ความกังวล', 'ช่วงนี้มีเรื่องให้เธอคิดวนหรือกังวลบ่อยแค่ไหน?'],
  ['การพักผ่อน', 'ช่วงนี้เธอมีช่วงเวลาที่ได้พักตามที่ต้องการบ่อยแค่ไหน?'],
  ['เพื่อน', 'ช่วงนี้เธอรู้สึกสบายใจเวลาอยู่กับเพื่อนบ่อยแค่ไหน?'],
  ['ครอบครัว', 'ช่วงนี้เธอรู้สึกว่าคุยกับคนในครอบครัวได้บ่อยแค่ไหน?'],
  ['ความมั่นใจ', 'ช่วงนี้เธอรู้สึกมั่นใจในสิ่งที่ตัวเองทำบ่อยแค่ไหน?'],
  ['โรงเรียน', 'ช่วงนี้เธอรู้สึกเป็นส่วนหนึ่งของโรงเรียนบ่อยแค่ไหน?'],
  ['ความช่วยเหลือ', 'เมื่ออยากขอความช่วยเหลือ เธอรู้ว่าติดต่อใครได้บ่อยแค่ไหน?'],
];
const answers = ['แทบไม่เคย', 'บางครั้ง', 'ค่อนข้างบ่อย', 'เกือบทุกวัน'];

export function Wellbeing() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const finished = step === questions.length;
  return <div className="rf-page">
    <ReflectionHeader area="อารมณ์ของฉัน" title="สำรวจสุขภาวะทางใจ" description="ใช้เวลาสั้น ๆ สังเกตความรู้สึกในช่วงนี้ ตอบเท่าที่พร้อม หรือข้ามข้อไหนก็ได้" />
    <EmotionNav />
    <section className="rf-panel rf-question">
      {finished ? <>
        <span className="rf-icon" data-tone="mint"><Flower2 /></span><h2>สิ่งที่เธอสังเกตได้ในวันนี้</h2>
        <p>นี่คือคำตอบที่เธอเลือกไว้เพื่อทบทวนความรู้สึกของตัวเอง</p>
        {Object.keys(responses).length > 0 ? <dl className="rf-summary">{questions.map(([topic], index) => responses[index] &&
          <div key={topic}><dt>{topic}</dt><dd>{responses[index]}</dd></div>)}</dl> : <p>เธอข้ามคำถามทั้งหมดได้ และกลับมาเริ่มใหม่เมื่อพร้อม</p>}
        <div className="rf-actions"><Link className="rf-button" to="/student/journal">เขียนบันทึก</Link><Link className="rf-button rf-secondary" to="/student/wellness">พักใจสักครู่</Link><Link className="rf-button rf-secondary" to="/student/support">คุยกับครู</Link></div>
        <button className="rf-text-button" type="button" onClick={() => { setStep(0); setResponses({}); }}>เริ่มสำรวจใหม่</button>
      </> : <>
        <div className="rf-split"><span className="rf-eyebrow">{questions[step][0]}</span><span className="rf-muted">ข้อ {step + 1} จาก {questions.length}</span></div>
        <progress className="rf-progress" aria-label="ความคืบหน้า" value={step + 1} max={questions.length} />
        <h2>{questions[step][1]}</h2>
        <div className="rf-choice-grid">{answers.map((value) => <button key={value} type="button" className="rf-choice" aria-pressed={responses[step] === value} onClick={() => setResponses({ ...responses, [step]: value })}>{value}</button>)}</div>
        <div className="rf-split rf-actions">
          <button type="button" className="rf-button rf-secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ArrowLeft size={17} />ย้อนกลับ</button>
          <div className="rf-actions">
            <button type="button" className="rf-text-button" onClick={() => {
              setResponses((previous) => Object.fromEntries(Object.entries(previous).filter(([index]) => Number(index) !== step)));
              setStep((value) => value + 1);
            }}>ข้ามข้อนี้</button>
            <button type="button" className="rf-button" disabled={!responses[step]} onClick={() => setStep((value) => value + 1)}>{step === questions.length - 1 ? 'ดูสรุป' : 'ข้อต่อไป'}<ArrowRight size={17} /></button>
          </div>
        </div>
      </>}
      <p className="rf-note">แบบสำรวจนี้มีไว้สำหรับทบทวนตัวเอง ไม่ใช่เครื่องมือวินิจฉัยภาวะสุขภาพจิต</p>
    </section>
  </div>;
}

type Activity = { id: string; title: string; description: string; icon: typeof Heart; tone: string };
const activities: Activity[] = [
  { id: 'breathe', title: 'ฝึกหายใจ', description: 'พักจากสิ่งที่กำลังทำ แล้วหายใจตามจังหวะที่สบาย', icon: Wind, tone: 'lavender' },
  { id: 'ground', title: 'กลับมาอยู่กับปัจจุบัน', description: 'ใช้ประสาทสัมผัสค่อย ๆ สังเกตรอบตัว', icon: Flower2, tone: 'mint' },
  { id: 'timer', title: 'ตั้งเวลาพัก', description: 'ให้เวลาตัวเองได้พักสักครู่ก่อนกลับไปทำสิ่งต่อไป', icon: Clock3, tone: 'pink' },
  { id: 'reflect', title: 'ทบทวนความรู้สึก', description: 'ใช้คำถามสั้น ๆ ชวนสังเกตสิ่งที่อยู่ในใจ', icon: BookHeart, tone: 'blue' },
  { id: 'study', title: 'จัดการความเครียดจากการเรียน', description: 'แบ่งงานเป็นขั้นเล็ก ๆ และเว้นช่วงให้ตัวเองพัก', icon: GraduationCap, tone: 'yellow' },
  { id: 'sleep', title: 'สร้างกิจวัตรก่อนนอน', description: 'ลองเลือกกิจวัตรที่ทำได้จริงเพื่อเตรียมตัวพักผ่อน', icon: Moon, tone: 'lavender' },
  { id: 'kindness', title: 'ใจดีกับตัวเอง', description: 'ลองพูดกับตัวเองเหมือนที่เธอจะพูดกับเพื่อนที่รัก', icon: Heart, tone: 'pink' },
  { id: 'practice', title: 'ซ้อมขอความช่วยเหลือ', description: 'หาคำเริ่มต้นและวิธีคุยที่เธอสบายใจ', icon: HandHeart, tone: 'mint' },
];

function RestTimer({ breathing }: { breathing: boolean }) {
  const [duration, setDuration] = useState(breathing ? 60 : 120);
  const [seconds, setSeconds] = useState(duration);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = window.setTimeout(() => setSeconds((previous) => previous - 1), 1000);
    return () => window.clearTimeout(id);
  }, [running, seconds]);
  const ticking = running && seconds > 0;
  const phase = (duration - seconds) % 10;
  const inhale = phase < 4;
  const countdown = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return <>
    <label className="rf-field">เลือกระยะเวลา
      <select value={duration} onChange={(event) => {
        const value = Number(event.target.value);
        setDuration(value); setSeconds(value); setRunning(false);
      }}>
        {[60, 120, 180, 300].map((value) => <option value={value} key={value}>{value / 60} นาที</option>)}
      </select>
    </label>
    {breathing ? <div className="rf-breath-stage"><div className="rf-breath" data-active={ticking} data-phase={inhale ? 'in' : 'out'}><Wind size={35} /><strong>{seconds === 0 ? 'พักได้ตามสบาย' : ticking ? inhale ? 'หายใจเข้า' : 'หายใจออก' : 'เริ่มเมื่อพร้อม'}</strong></div></div> : <p className="rf-countdown" aria-label="เวลาที่เหลือ">{countdown}</p>}
    <div className="rf-actions rf-center">
      {breathing && <span className="rf-muted">{countdown}</span>}
      <button className="rf-button" type="button" onClick={() => {
        if (seconds === 0) { setSeconds(duration); setRunning(true); }
        else setRunning(!running);
      }}>{ticking ? 'พักชั่วคราว' : seconds < duration && seconds > 0 ? 'ทำต่อ' : 'เริ่ม'}</button>
      <button className="rf-button rf-secondary" type="button" onClick={() => { setSeconds(duration); setRunning(false); }}>{breathing ? 'หยุด' : 'เริ่มเวลาใหม่'}</button>
    </div>
    <p className="rf-note">{seconds === 0 ? 'ครบเวลาแล้ว เธอจะพักต่ออีกสักครู่ก็ได้' : breathing ? 'ปล่อยไหล่ให้สบาย หายใจตามจังหวะของตัวเอง หากอึดอัด ให้หยุดและหายใจตามปกติ' : 'ลองวางสิ่งที่ทำอยู่ ยืดตัว หรือมองออกไปไกล ๆ'}</p>
  </>;
}

const senses = [
  ['5 สิ่งที่มองเห็น', 'มองรอบตัวแล้วค่อย ๆ สังเกตสี รูปร่าง หรือรายละเอียดของสิ่งของ 5 อย่าง'],
  ['4 สิ่งที่สัมผัสได้', 'ลองสังเกตผิวสัมผัสของเสื้อผ้า เก้าอี้ หรือสิ่งอื่นที่อยู่ใกล้ ๆ'],
  ['3 สิ่งที่ได้ยิน', 'ลองฟังเสียงรอบตัว 3 เสียงที่เธอแยกออกจากกันได้'],
  ['2 สิ่งที่ได้กลิ่น', 'ลองสังเกตกลิ่นรอบตัว หรือคิดถึงกลิ่นที่เธอชอบ'],
  ['1 สิ่งที่รับรส', 'สังเกตรสในปาก หรือจิบน้ำสักเล็กน้อยหากสะดวก'],
];

function Grounding() {
  const [step, setStep] = useState(0);
  return step === senses.length ? <>
    <p className="rf-note">เธอมีเวลาให้ตัวเองได้สังเกตสิ่งรอบตัวแล้ว ลองนั่งพักต่ออีกนิดถ้าอยากพัก</p>
    <button className="rf-button rf-secondary" type="button" onClick={() => setStep(0)}>เริ่มใหม่</button>
  </> : <>
    <progress className="rf-progress" aria-label="ความคืบหน้ากิจกรรม" value={step + 1} max={senses.length} />
    <h3>{senses[step][0]}</h3><p>{senses[step][1]}</p>
    <div className="rf-actions"><button className="rf-button rf-secondary" type="button" disabled={!step} onClick={() => setStep(step - 1)}>ย้อนกลับ</button>
      <button className="rf-text-button" type="button" onClick={() => setStep(step + 1)}>ข้าม</button>
      <button className="rf-button" type="button" onClick={() => setStep(step + 1)}>{step === 4 ? 'เสร็จแล้ว' : 'ถัดไป'}</button></div>
  </>;
}

function WellnessReflection({ kindness }: { kindness: boolean }) {
  const { state } = useDemo();
  const [notes, setNotes] = useState(['', '']);
  const prompts = kindness ? ['ถ้าเพื่อนเจอเรื่องเดียวกัน เธอจะบอกอะไรกับเขา?', 'มีประโยคไหนที่เธออยากบอกตัวเองบ้าง?'] : ['ตอนนี้ความรู้สึกไหนชัดที่สุดสำหรับเธอ?', 'มีสิ่งเล็ก ๆ อะไรที่เธออยากให้ตัวเองได้ในวันนี้?'];
  const body = notes.flatMap((note, index) => note.trim() ? [`${prompts[index]}\n${note.trim()}`] : []).join('\n\n');
  return <>
    {prompts.map((prompt, index) => <label className="rf-field" key={prompt}>{prompt}<textarea value={notes[index]} onChange={(event) => setNotes(notes.map((note, current) => current === index ? event.target.value : note))} placeholder="เขียนเท่าที่อยากเขียน" rows={2} maxLength={500} /></label>)}
    <div className="rf-actions"><Link className="rf-button" to="/student/journal" onClick={() => setReflectionTransfer('journal', { body }, state.revision)}>เก็บไว้ในบันทึกส่วนตัว</Link><button className="rf-button rf-secondary" type="button" onClick={() => setNotes(['', ''])}>ล้างคำตอบ</button></div>
  </>;
}

function HabitChecks({ study }: { study: boolean }) {
  const [items, setItems] = useState<string[]>([]);
  const [plan, setPlan] = useState('');
  const tasks = study ? ['เลือกเรื่องสำคัญหนึ่งอย่างที่จะเริ่ม', 'เตรียมอุปกรณ์และแบ่งงานเป็นช่วงสั้น ๆ', 'วางช่วงพักไว้ระหว่างการอ่าน', 'เตรียมของสำหรับวันสอบ'] : ['กำหนดเวลาพักคร่าว ๆ', 'เตรียมกิจกรรมเบา ๆ ก่อนเข้านอน', 'เลือกมุมพักที่เงียบและสบาย', 'เตรียมสิ่งที่ต้องใช้ในวันพรุ่งนี้'];
  return <>
    {study && <label className="rf-field">สิ่งเล็ก ๆ ที่อยากเริ่ม<textarea rows={2} value={plan} onChange={(event) => setPlan(event.target.value)} placeholder="เช่น ทบทวนหนึ่งหัวข้อ แล้วพัก" /></label>}
    <ul className="rf-checklist">{tasks.map((task) => <li key={task}><label><input type="checkbox" checked={items.includes(task)} onChange={() => setItems(items.includes(task) ? items.filter((item) => item !== task) : [...items, task])} />{task}</label></li>)}</ul>
    {study && <p className="rf-note">ถ้าเริ่มรู้สึกล้า ลองหยุดพัก ดื่มน้ำ หรือขยับตัวสักครู่</p>}
    <button className="rf-button rf-secondary" type="button" onClick={() => { setItems([]); setPlan(''); }}>เริ่มใหม่</button>
  </>;
}

function HelpPractice() {
  const [selection, setSelection] = useState('');
  const choices = ['อยากให้มีคนรับฟัง', 'อยากได้รับคำแนะนำ', 'อยากให้ช่วยคิดทางออก', 'อยากนัดพูดคุยเป็นส่วนตัว'];
  return <>
    <p>ถ้าจะเริ่มคุยกับครู เธออยากให้ครูช่วยแบบไหน?</p>
    <div className="rf-choice-grid">{choices.map((choice) => <button key={choice} type="button" className="rf-choice" aria-pressed={selection === choice} onClick={() => setSelection(choice)}>{choice}</button>)}</div>
    {selection && <><blockquote>“สวัสดีค่ะคุณครู ช่วงนี้มีเรื่องอยากคุยด้วย หนู{selection} พอจะมีเวลาคุยกันไหมคะ?”</blockquote><Link className="rf-button" to="/student/support">ลองใช้ในหน้าขอความช่วยเหลือ</Link></>}
  </>;
}

export function Wellness() {
  const [active, setActive] = useState<Activity>();
  const practice: Record<string, ReactNode> = {
    breathe: <RestTimer key="breathe" breathing />, ground: <Grounding />, timer: <RestTimer key="timer" breathing={false} />,
    reflect: <WellnessReflection key="reflect" kindness={false} />, study: <HabitChecks key="study" study />, sleep: <HabitChecks key="sleep" study={false} />,
    kindness: <WellnessReflection key="kindness" kindness />, practice: <HelpPractice />,
  };
  return <div className="rf-page">
    <ReflectionHeader area="พื้นที่ของฉัน" title="กิจกรรมดูแลใจ" description="เลือกกิจกรรมสั้น ๆ ที่เข้ากับสิ่งที่เธอต้องการในตอนนี้" />
    {active ? <section className="rf-panel rf-question">
      <button className="rf-text-button" type="button" onClick={() => setActive(undefined)}><ArrowLeft size={17} />กิจกรรมทั้งหมด</button>
      <span className="rf-icon" data-tone={active.tone}><active.icon /></span>
      <h2>{active.title}</h2><p>{active.description}</p>{practice[active.id]}
    </section> : <div className="rf-wellness-grid">{activities.map((activity) => <button className="rf-panel rf-activity" type="button" key={activity.id} onClick={() => setActive(activity)}>
      <span className="rf-icon" data-tone={activity.tone}><activity.icon /></span><strong>{activity.title}</strong><span>{activity.description}</span>
    </button>)}</div>}
  </div>;
}

export function Urgent() {
  return <div className="rf-page">
    <ReflectionHeader area="ช่องทางช่วยเหลือ" title="ต้องการความช่วยเหลือเร่งด่วน" description="หากต้องการความช่วยเหลือตอนนี้ ให้ติดต่อคนที่ช่วยได้โดยตรง" actions={<BackToStudent />} />
    <section className="rf-panel rf-question">
      <span className="rf-icon" data-tone="pink"><ShieldAlert /></span>
      <h2>ติดต่อคนที่อยู่ใกล้หรือพร้อมช่วย</h2>
      <ul className="rf-help-list"><li>ติดต่อผู้ใหญ่ที่ไว้วางใจ</li><li>ติดต่อครูแนะแนวหรือผู้รับผิดชอบของโรงเรียน</li></ul>
      <div className="rf-urgent-choices">
        <a href="tel:1323"><Headphones /><span><strong>1323</strong>สายด่วนสุขภาพจิต</span></a>
        <a href="tel:1669"><Phone /><span><strong>1669</strong>เหตุฉุกเฉินทางการแพทย์</span></a>
      </div>
      <p className="rf-note">MindBridge เป็นเว็บไซต์สาธิต ไม่ใช่บริการฉุกเฉิน ไม่มีเจ้าหน้าที่เฝ้าระวังตลอด 24 ชั่วโมง และไม่สามารถส่งคำขอความช่วยเหลือไปยังบุคคลจริงได้</p>
      <p className="rf-smaller"><a href="https://checkin.dmh.go.th/contact" target="_blank" rel="noreferrer">กรมสุขภาพจิต</a> · <a href="https://www.niems.go.th/1/UploadAttachFile/2025/EBook/421456_20250709121019.pdf" target="_blank" rel="noreferrer">สถาบันการแพทย์ฉุกเฉินแห่งชาติ</a></p>
    </section>
  </div>;
}

const ladder = [
  { title: 'FEEL', thai: 'เข้าใจความรู้สึก', line: 'อยากทำความเข้าใจว่าตัวเองกำลังรู้สึกอะไร', icon: Brain, tone: 'yellow',
    links: [['วงล้ออารมณ์', 'emotion-decoder'], ['เช็กอินความรู้สึก', 'emotions'], ['สำรวจสุขภาวะทางใจ', 'wellbeing']] },
  { title: 'REFLECT', thai: 'ระบายในพื้นที่ของตัวเอง', line: 'อยากระบาย แต่ยังไม่พร้อมให้ใครรู้', icon: BookHeart, tone: 'mint',
    links: [['เขียนบันทึกส่วนตัว', 'journal'], ['วาดความรู้สึก', 'drawing'], ['บันทึกเสียงชั่วคราว', 'voice']] },
  { title: 'SIGNAL', thai: 'ส่งสัญญาณขอความช่วยเหลือ', line: 'อยากให้ใครสักคนรู้ว่าตอนนี้ต้องการความช่วยเหลือ', icon: Wind, tone: 'lavender',
    links: [['เลือกครูและส่งสัญญาณ', 'support?mode=signal']] },
  { title: 'EXPRESS', thai: 'เล่าบางส่วนที่พร้อม', line: 'พร้อมเล่าความรู้สึกบางส่วนแล้ว', icon: Heart, tone: 'pink',
    links: [['เลือกสิ่งที่จะแชร์กับครู', 'support?mode=express'], ['เขียนข้อความ', 'messages']] },
  { title: 'CONNECT', thai: 'เชื่อมต่อกับครู', line: 'พร้อมพูดคุยกับคนที่ไว้วางใจ', icon: HandHeart, tone: 'blue',
    links: [['เปิดข้อความ', 'messages'], ['ขอนัดหมาย', 'appointments'], ['ดูเส้นทางการดูแล', 'journey']] },
];

export function TrustLadder() {
  const [step, setStep] = useState(2);
  const current = ladder[step];
  return <div className="rf-page">
    <ReflectionHeader area="สะพานใจ" title="Trust Ladder — เปิดใจตามความพร้อม" description="เลือกจุดเริ่มต้นที่ตรงกับความรู้สึกตอนนี้ เธอกลับมาเลือกใหม่หรือหยุดพักเมื่อไรก็ได้" />
    <section className="rf-ladder rf-panel" aria-label="ตัวเลือกสื่อสารตามความพร้อม">
      <svg className="rf-ladder-art" aria-hidden="true" viewBox="0 0 1100 320" preserveAspectRatio="none">
        <path d="M-50 245 Q 205 282 330 174 Q 549 -11 770 174 Q 905 284 1150 245" fill="none" stroke="#e6d8f7" strokeWidth="46" />
        <path d="M-50 239 Q 205 276 330 168 Q 549 -17 770 168 Q 905 278 1150 239" fill="none" stroke="#fcf9ff" strokeWidth="10" />
        <path d="M70 270v39m114-41v48m112-92v80m99-166v131m122-178v165m122-165v165m112-113v130m109-51v77m109-33v45" stroke="#dbc9ee" strokeWidth="5" strokeLinecap="round" />
        <path d="M31 305q122-38 244 0t244 0t244 0t244 0" fill="none" stroke="#e7ddef" strokeWidth="2" />
        <circle cx="180" cy="87" r="8" fill="#efdae9"/><circle cx="914" cy="82" r="7" fill="#ded9f4"/><circle cx="1025" cy="125" r="4" fill="#eddbed"/>
        <path d="M553 54c-15-13-30-19-28-32 2-10 17-13 27-2 10-11 24-8 27 2 3 12-10 19-26 32z" fill="#e1ccf0"/>
      </svg>
      <div className="rf-ladder-nodes">
        {ladder.map((item, index) => <button type="button" className="rf-ladder-node" key={item.title} aria-pressed={index === step} onClick={() => setStep(index)}>
          <span className="rf-icon" data-tone={item.tone}><item.icon /></span><strong>{item.title}</strong><span>{item.thai}</span>
        </button>)}
      </div>
    </section>
    <section className="rf-panel rf-ladder-detail" aria-live="polite">
      <span className="rf-icon" data-tone={current.tone}><current.icon /></span>
      <div><span className="rf-eyebrow">{current.title}</span><h2>{current.thai}</h2><p>“{current.line}”</p>
        <div className="rf-actions">{current.links.map(([label, route], index) => <Link className={`rf-button ${index > 0 ? 'rf-secondary' : ''}`} to={`/student/${route}`} key={route}>{label}</Link>)}</div>
      </div>
    </section>
  </div>;
}
