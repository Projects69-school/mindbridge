import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AudioLines, BookOpen, ChevronDown, CircleHelp, Compass, Flower2, GraduationCap,
  HandHeart, Heart, HeartHandshake, Layers3, LockKeyhole, Menu, MessageCircle, Play, Shapes, ShieldCheck, Sparkles, X,
} from 'lucide-react'
import { Brand, DemoNotice } from '../components/ui'
import '../styles/public.css'

const features = [
  { icon: Compass, tone: 'lavender', name: 'Emotion Decoder', title: 'หาคำให้ความรู้สึก', text: 'สำรวจวงล้ออารมณ์เพื่อเจอคำที่ใกล้กับความรู้สึกของตัวเอง แล้วเลือกเก็บไว้หรือแบ่งปันเมื่อพร้อม', href: '/student/emotion-decoder' },
  { icon: Layers3, tone: 'pink', name: 'Trust Ladder', title: 'เปิดใจตามความพร้อม', text: 'เริ่มจากทบทวนกับตัวเอง ส่งสัญญาณสั้น ๆ หรือเลือกพูดคุยกับครูในจังหวะของตัวเอง', href: '/student/trust-ladder' },
  { icon: HeartHandshake, tone: 'mint', name: 'Support Matching', title: 'เลือกความช่วยเหลือที่ตรงใจ', text: 'บอกครูได้ว่าอยากให้รับฟัง ช่วยคิด หรือช่วยนัดพูดคุย พร้อมเลือกว่าจะเล่าอะไรบ้าง', href: '/student/support' },
  { icon: BookOpen, tone: 'blue', name: 'Teacher Guidance', title: 'ช่วยครูเริ่มต้นบทสนทนา', text: 'ใช้ตัวอย่างประโยคและแนวทางการฟังเพื่อชวนคุยอย่างเคารพความรู้สึกของนักเรียน', href: '/teacher/guidance' },
  { icon: AudioLines, tone: 'lavender', name: 'Care Loop', title: 'ดูแลต่อหลังเริ่มคุย', text: 'วางแผน นัดติดตาม และเปิดให้นักเรียนสะท้อนว่าการช่วยเหลือตอบโจทย์แค่ไหน', href: '/teacher/care' },
  { icon: LockKeyhole, tone: 'pink', name: 'Privacy by Design', title: 'ให้นักเรียนเลือกสิ่งที่แชร์', text: 'บันทึกและเช็กอินเป็นส่วนตัว นักเรียนตรวจดูสำเนาที่ครูจะได้รับได้ก่อนส่ง', href: '/student/settings?tab=privacy' },
]

function PublicHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpen(false) }, [location.pathname, location.search])
  return <header className="public-header"><div className="public-wrap public-nav">
    <Brand />
    <button className="icon-btn public-menu" aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav className={`public-links ${open ? 'public-links-open' : ''}`} aria-label="เมนูหลัก">
      <Link className={location.pathname === '/' && !location.search ? 'current' : ''} to="/">หน้าหลัก</Link>
      <Link to="/?section=about">เกี่ยวกับเรา</Link>
      <Link to="/?section=features">ฟีเจอร์</Link>
      <Link className={location.pathname === '/innovation' ? 'current' : ''} to="/innovation">นวัตกรรมของเรา</Link>
      <Link to="/?section=safety">ความปลอดภัย</Link>
    </nav>
    <Link to="/select-role" className="btn btn-primary public-nav-cta">ทดลองใช้งาน</Link>
  </div></header>
}

function Footer() {
  return <footer className="public-footer"><div className="public-wrap">
    <div className="footer-main"><div><Brand subtitle /><p>ทุกความรู้สึกมีความหมาย<br />ทุกเรื่องราวมีคนพร้อมรับฟัง</p></div>
      <nav aria-label="เมนูส่วนท้าย"><Link to="/?section=about">เกี่ยวกับเรา</Link><Link to="/innovation">นวัตกรรมของเรา</Link><Link to="/select-role">ทดลองใช้งาน</Link><Link to="/?section=safety">ความปลอดภัย</Link></nav>
    </div><div className="footer-bottom"><span>MindBridge · โครงการนวัตกรรมการศึกษา</span><span>Bridging Feelings, Building Trust.</span></div>
  </div></footer>
}
export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="public-shell"><PublicHeader /><DemoNotice /><main id="main-content">{children}</main><Footer /></div>
}

export function Landing() {
  const { search } = useLocation()
  useEffect(() => {
    const section = new URLSearchParams(search).get('section')
    const frame = requestAnimationFrame(() => section ? document.getElementById(section)?.scrollIntoView() : window.scrollTo(0, 0))
    return () => cancelAnimationFrame(frame)
  }, [search])
  return <PublicShell>
    <section className="public-wrap landing-hero">
      <div className="hero-content">
        <div className="hero-label"><Heart size={15} fill="currentColor" /> สะพานใจ เชื่อมครู เชื่อมนักเรียน</div>
        <h1>บางความรู้สึก<br className="desktop-break" />พูดออกมายาก<br className="desktop-break" /> <em>แต่ไม่จำเป็นต้อง<br className="desktop-break" />เก็บไว้คนเดียว</em></h1>
        <p>MindBridge พื้นที่เชื่อมโยงความรู้สึกระหว่างนักเรียนกับครู เพื่อให้ทุกการขอความช่วยเหลือเริ่มต้นได้ง่ายขึ้น</p>
        <div className="button-row hero-buttons">
          <Link to="/select-role" className="btn btn-primary btn-large">ทดลองใช้งาน</Link>
          <Link to="/?section=about" className="btn btn-secondary btn-large">รู้จัก MindBridge</Link>
        </div>
        <div className="hero-note"><LockKeyhole size={15} /> เลือกได้ว่าอยากเล่าอะไร และอยากเล่าให้ใครฟัง</div>
      </div>
      <figure className="hero-figure">
        <img src={`${import.meta.env.BASE_URL}assets/bridge.svg`} width="690" height="540" alt="ภาพวาดนักเรียนและครูคุยกันบนสะพานสีลาเวนเดอร์" fetchPriority="high" />
      </figure>
    </section>
    <div className="public-wrap"><div className="landing-strip">
      {[{ icon: Flower2, title: 'รู้ทันความรู้สึก', text: 'เริ่มจากการสำรวจใจตัวเอง' }, { icon: MessageCircle, title: 'สื่อสารในแบบที่พร้อม', text: 'ส่งสัญญาณได้แม้ยังเล่าไม่ออก' }, { icon: HandHeart, title: 'ดูแลกันอย่างต่อเนื่อง', text: 'ครูและนักเรียนติดตามไปด้วยกัน' }].map(({ icon: Icon, title, text }) =>
        <div key={title}><span className="icon-tile"><Icon size={23} /></span><span><strong>{title}</strong><small>{text}</small></span></div>)}
    </div></div>
    <section id="about" className="public-wrap public-section about-section">
      <div><div className="eyebrow">ที่มาของ MindBridge</div><h2>ความช่วยเหลือเริ่มได้<br />ก่อนจะมีคำอธิบาย</h2></div>
      <div><p>บางครั้งนักเรียนรู้ว่าตัวเองกำลังเหนื่อยหรือกังวล แต่ยังหาคำไม่เจอ กลัวถูกตัดสิน หรือยังไม่รู้ว่าจะเริ่มคุยกับใคร ฝั่งครูก็อาจไม่ทันเห็นว่านักเรียนกำลังอยากให้ช่วย</p><p>MindBridge ให้นักเรียนเริ่มจากสำรวจใจ ระบายเป็นส่วนตัว หรือบอกครูสั้น ๆ ว่าอยากให้รับฟัง ครูจึงเริ่มบทสนทนาได้จากสิ่งที่นักเรียนเลือกแบ่งปัน</p></div>
    </section>
    <section id="features" className="feature-section"><div className="public-wrap public-section">
      <div className="section-heading"><div className="eyebrow">ก่อน ระหว่าง และหลังการขอความช่วยเหลือ</div><h2>พื้นที่ให้ทั้งสองฝ่ายเริ่มคุยกัน</h2></div>
      <div className="feature-grid">{features.map(({ icon: Icon, name, tone, title, text, href }) => <article className="feature-card" key={name}>
        <div className={`icon-tile tone-${tone}`}><Icon size={23} /></div><small>{name}</small><h3>{title}</h3><p>{text}</p><Link to={href}>ลองใช้ <span className="sr-only">{title}</span></Link>
      </article>)}</div>
    </div></section>
    <section className="public-wrap public-section bridge-explainer">
      <div className="bridge-art" aria-hidden="true"><RoleArt teacher={false} /><span><Heart size={34} /></span><RoleArt teacher /></div>
      <div><div className="eyebrow">Trust Ladder · เปิดใจตามความพร้อม</div><h2>เริ่มตรงไหนก็ได้<br />หยุดเมื่ออยากพัก</h2><p>สำรวจ ระบาย ส่งสัญญาณ เล่าบางส่วน หรือพูดคุยโดยตรง ทุกทางเลือกช่วยให้เริ่มจากสิ่งที่ตัวเองพร้อม</p><Link className="btn btn-primary" to="/student/trust-ladder">ลองเลือกวิธีเปิดใจ</Link></div>
    </section>
    <section id="safety" className="safety-section"><div className="public-wrap public-section safety-grid">
      <div><div className="eyebrow">ความปลอดภัยและจริยธรรม</div><h2>ความไว้ใจเริ่มจากการมีสิทธิ์เลือก</h2><p>แนวทางการฟังอย่างตั้งใจ การยอมรับความรู้สึก และการเคารพการเปิดเผยตามความสมัครใจ ช่วยให้โรงเรียนมีภาษาร่วมกันในการดูแลนักเรียน</p></div>
      <div className="safety-points"><div><ShieldCheck /><span><strong>เห็นก่อนส่ง</strong><small>ตรวจข้อมูล ผู้รับ และจุดประสงค์ก่อนยืนยันการแบ่งปัน</small></span></div><div><LockKeyhole /><span><strong>ใช้ข้อมูลสมมติในแท็บนี้</strong><small>การเปลี่ยนแปลงอยู่ในหน่วยความจำและคืนค่าเมื่อรีเฟรช</small></span></div><div><CircleHelp /><span><strong>ช่องทางช่วยเหลือจริง</strong><small>หน้านี้เป็นการสาธิตการสื่อสารในโรงเรียน</small><Link to="/student/urgent">ดูช่องทางติดต่อเมื่อเร่งด่วน</Link></span></div></div>
    </div></section>
    <section className="public-wrap public-section faq-section"><div><div className="eyebrow">คำถามที่พบบ่อย</div><h2>ก่อนเริ่มทดลอง</h2></div><div className="faq-list">
      {[['ต้องสร้างบัญชีไหม?', 'เลือกบทบาทนักเรียนหรือคุณครูแล้วเริ่มได้ทันที ทุกคนใช้ตัวอย่างสมมติชุดเดียวกันในแท็บของตัวเอง'], ['เมื่อสลับบทบาท ข้อมูลจะหายไหม?', 'คำขอ ข้อความ และนัดหมายยังอยู่ในแท็บเดิม ถ้ารีเฟรชหรือเลือกเริ่มการสาธิตใหม่ ระบบจะคืนชุดข้อมูลตั้งต้น'], ['ครูเห็นบันทึกส่วนตัวหรือไม่?', 'หน้าครูแสดงเฉพาะสำเนาที่นักเรียนเลือกแบ่งปันกับครูคนนั้น การแยกข้อมูลนี้เป็นตัวอย่างการออกแบบสิทธิ์สำหรับเดโมสาธารณะ'], ['โรงเรียนใช้ MindBridge กับนักเรียนจริงได้ไหม?', 'รุ่นนี้ใช้เพื่อทดลองแนวคิด การใช้กับนักเรียนจริงต้องผ่านการประเมินความปลอดภัย การคุ้มครองข้อมูล และการออกแบบขั้นตอนรับมือเหตุเร่งด่วน']].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}
    </div></section>
    <section className="public-wrap public-section public-callout"><div><h2>ลองเดินข้ามสะพานด้วยตัวเอง</h2><p>เริ่มจากมุมของนักเรียน แล้วสลับไปดูว่าครูได้รับอะไร</p></div><Link to="/select-role" className="btn btn-primary btn-large">ทดลองใช้งาน</Link></section>
  </PublicShell>
}

function RoleArt({ teacher }: { teacher: boolean }) {
  return <svg viewBox="0 0 260 160" aria-hidden="true" className="role-art">
    <ellipse cx="130" cy="137" rx="98" ry="13" fill={teacher ? '#d9d7fa' : '#e8d6f5'} />
    <circle cx="130" cy="72" r="64" fill={teacher ? '#eeedff' : '#f8ecfc'} />
    <path d="M25 70h22m-11-11v22m175 7h18m-9-9v18" stroke={teacher ? '#a193d7' : '#b891ce'} strokeWidth="2" strokeLinecap="round"/>
    <path d="M178 44c-13-9-3-20 5-12 8-8 18 3 5 12l-5 4Z" fill={teacher ? '#b5a5ea' : '#d199cd'}/>
    <path d="M78 137c6-35 16-51 50-51s47 17 53 51" fill={teacher ? '#8171bc' : '#ac84ce'}/>
    <path d={teacher ? 'M97 80V54c0-20 15-34 34-34 20 0 35 14 35 34v33c-11 8-58 7-69-7Z' : 'M99 59c0-24 12-37 31-37 21 0 35 16 32 41l-11 21h-44Z'} fill="#3f365b"/>
    <path d="M121 79h19v15c-4 8-16 8-19 0V79Z" fill="#e9aa97"/>
    <path d="M105 59c5-2 16-13 23-20 6 8 15 16 28 19v4c0 16-11 29-25 29s-26-13-26-29Z" fill="#f6c3ae"/>
    <path d="M116 63h2m25 0h2m-19 10q5 5 10 0" stroke="#5b4165" fill="none" strokeWidth="2" strokeLinecap="round"/>
    {teacher && <path d="M113 59h12v9h-12zm24 0h12v9h-12zm-12 4h12" stroke="#6a507d" strokeWidth="1.6" fill="none" />}
    <path d="M86 138v-22m86 22v-22" stroke="#6b55a6" opacity=".4" strokeWidth="2" strokeLinecap="round"/>
    {teacher ? <path d="M113 108q18-7 35 0v22q-17-7-35 0Z" fill="#e9dffc" stroke="#e9dffc" strokeLinejoin="round" strokeWidth="3"/> : <path d="M130 124c-24-14-12-26 0-14 12-12 24 0 0 14Z" fill="#fae3f1" />}
  </svg>
}
export function RoleSelection() {
  return <PublicShell><section className="public-wrap role-section">
    <div className="section-heading"><div className="eyebrow">สาธิต MindBridge</div><h1>เลือกบทบาทที่ต้องการทดลองใช้งาน</h1><p>ลองใช้งานด้วยข้อมูลสมมติ สลับมุมมองได้ทุกเวลา</p></div>
    <div className="role-grid">{[
      { teacher: false, icon: GraduationCap, title: 'นักเรียน', text: 'พื้นที่สำหรับสำรวจความรู้สึก ระบายเรื่องราว และขอความช่วยเหลือจากครูที่ไว้วางใจ', button: 'เข้าสู่โหมดนักเรียน' },
      { teacher: true, icon: HandHeart, title: 'คุณครู', text: 'พื้นที่สำหรับรับฟัง เข้าใจ และดูแลช่วยเหลือนักเรียนอย่างต่อเนื่อง', button: 'เข้าสู่โหมดคุณครู' },
    ].map(({ teacher, icon: Icon, title, text, button }) => <article key={title} className={`role-card ${teacher ? 'role-card-teacher' : ''}`}>
      <div className="role-card-art"><RoleArt teacher={teacher} /></div>
      <div className="role-card-text"><h2><Icon size={24} />{title}</h2><p>{text}</p><Link to={`/${teacher ? 'teacher' : 'student'}/dashboard`} className="btn btn-primary">{button}</Link></div>
    </article>)}</div>
    <Link to="/demo" className="btn btn-secondary"><Play size={17} /> เริ่มการสาธิตสำหรับกรรมการ</Link>
  </section></PublicShell>
}

const framework = [
  { code: 'FEEL', title: 'สำรวจอารมณ์', body: 'หาคำที่ตรงกับใจผ่านวงล้ออารมณ์หรือการเช็กอินส่วนตัว', link: '/student/emotion-decoder', icon: Compass },
  { code: 'TRUST', title: 'เลือกความพร้อม', body: 'เลือกวิธีเปิดใจด้วย Trust Ladder ตามที่สบายใจในตอนนี้', link: '/student/trust-ladder', icon: ShieldCheck },
  { code: 'EXPRESS', title: 'สื่อสารความรู้สึก', body: 'เขียน วาด หรือแบ่งปันเฉพาะบางส่วนที่เลือกเอง', link: '/student/journal', icon: BookOpen },
  { code: 'CONNECT', title: 'เชื่อมต่อกับครู', body: 'เลือกครูและบอกว่าต้องการให้รับฟังหรือช่วยแบบไหน', link: '/student/support', icon: MessageCircle },
  { code: 'SUPPORT', title: 'รับความช่วยเหลือ', body: 'ครูรับเรื่อง ฟังอย่างตั้งใจ และร่วมกำหนดสิ่งที่จะลองทำ', link: '/teacher/guidance', icon: HandHeart },
  { code: 'FOLLOW-UP', title: 'ติดตามผล', body: 'นัดทบทวนแผนและรับฟังความคิดเห็นเมื่อสถานการณ์เปลี่ยน', link: '/teacher/care', icon: HeartHandshake },
]
export function Innovation() {
  const [active, setActive] = useState(0)
  const current = framework[active]
  return <PublicShell><div className="public-wrap innovation">
    <section className="innovation-hero"><div className="hero-label"><Sparkles size={16} /> โครงการนวัตกรรมการศึกษา</div><h1>รู้จักนวัตกรรม MindBridge</h1><p>เราไม่ได้สร้างเพียงช่องทางให้เด็กคุยกับครู แต่เราสร้างสะพานที่ช่วยให้เด็กกล้าที่จะเริ่มต้นพูด</p><Link className="btn btn-primary" to="/demo"><Play size={17} /> เริ่มการสาธิตสำหรับกรรมการ</Link></section>
    <section className="panel framework-panel"><div className="eyebrow">MindBridge Framework</div><h2>กระบวนการเชื่อมใจหกส่วน</h2>
      <div className="framework-steps" role="group" aria-label="สำรวจกรอบการทำงาน">{framework.map(({ code, title, icon: Icon }, index) => <button className={active === index ? 'framework-step selected' : 'framework-step'} key={code} onClick={() => setActive(index)} aria-pressed={active === index}><Icon size={22}/><strong>{code}</strong><span>{title}</span></button>)}</div>
      <div className="framework-detail"><current.icon size={36} /><div><h3>{current.title}</h3><p>{current.body}</p></div><Link className="btn btn-secondary" to={current.link}>ลองขั้นตอนนี้</Link></div>
      <p className="muted">Trust Ladder และ MindBridge Framework เป็นแนวคิดเสนอเฉพาะโครงการ ยังไม่มีการตรวจสอบความเที่ยงตรงทางคลินิก</p>
    </section>
    <section className="public-section"><div className="section-heading"><div className="eyebrow">องค์ประกอบหลัก</div><h2>หกเครื่องมือที่เชื่อมกระบวนการดูแล</h2></div><div className="feature-grid">
      {features.map(({ name, icon: Icon, title, text, tone }) => <article className="feature-card" key={name}><span className={`icon-tile tone-${tone}`}><Icon size={23}/></span><small>{name}</small><h3>{title}</h3><p>{text}</p></article>)}
    </div></section>
    <section className="showcase-grid">
      <article className="panel"><Shapes /><h2>ที่มาและวัตถุประสงค์</h2><p>ช่วยให้นักเรียนที่ยังหาคำหรือวิธีเข้าหาครูได้ยาก เริ่มขอความช่วยเหลือได้ด้วยทางเลือกที่กดดันน้อยลง และให้ครูเห็นความต้องการที่นักเรียนเลือกบอก</p></article>
      <article className="panel"><Heart /><h2>หลักจิตวิทยาที่ประยุกต์ใช้</h2><p>การฟังอย่างตั้งใจ การยอมรับความรู้สึก แนวคิดผู้รับความช่วยเหลือเป็นศูนย์กลาง ความปลอดภัยทางใจ และการเปิดเผยตามความสมัครใจ</p></article>
      <article className="panel"><Compass /><h2>แนวทางประเมินผลและใช้ประโยชน์</h2><p>ทดสอบว่านักเรียนเข้าใจสิ่งที่แบ่งปันและส่งคำขอได้ง่ายเพียงใด วัดเวลาทำงานและเก็บความเห็นจากทั้งสองบทบาทเมื่อได้รับความยินยอม ก่อนพิจารณาทดลองใช้ในโรงเรียน</p></article>
      <article className="panel"><ShieldCheck /><h2>จริยธรรมและการต่อยอด</h2><p>การทดลองจริงต้องกำหนดสิทธิ์ ความยินยอม กระบวนการรับเรื่อง และการคุ้มครองข้อมูล อาจต่อยอดด้วยค่าบริการโรงเรียนหรือสิทธิ์ใช้งานระดับสถาบัน โดยไม่ขายข้อมูลนักเรียน</p></article>
    </section>
    <section className="public-section comparison"><h2>เปรียบเทียบกับแอปข้อความทั่วไป</h2><div className="panel table-scroll"><table><thead><tr><th>ช่วงของการดูแล</th><th>แอปข้อความทั่วไป</th><th>MindBridge</th></tr></thead><tbody><tr><td>ก่อนคุย</td><td>เปิดแชตและเริ่มพิมพ์</td><td>สำรวจความรู้สึก เลือกความพร้อม และส่งสัญญาณสั้น ๆ</td></tr><tr><td>ระหว่างคุย</td><td>แลกเปลี่ยนข้อความและไฟล์</td><td>เลือกข้อมูลที่จะส่งและใช้แนวทางรับฟังของครู</td></tr><tr><td>หลังคุย</td><td>กลับมาอ่านบทสนทนา</td><td>ร่วมวางแผน นัดติดตาม และสะท้อนผลการดูแล</td></tr></tbody></table></div></section>
  </div></PublicShell>
}
