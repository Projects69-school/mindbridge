import { useState } from 'react'
import { Activity, BarChart3, CalendarDays, CircleCheck, Clock3, Download, HeartHandshake, Printer, X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { appointmentStatus, appointmentsFor, offsetDate, requestsFor, requestStatus } from '../../utils/demo'
import { dateKey, dateLabel, ToolEmpty, ToolHeading, ToolNotice, ToolSection } from './ToolUI'

interface SeriesPoint { label: string; value: number; color?: string }

function Distribution({ data, unit }: { data: SeriesPoint[]; unit: string }) {
  const peak = Math.max(1, ...data.map((item) => item.value))
  if (!data.length) return <ToolEmpty title="ยังไม่มีข้อมูลในช่วงที่เลือก" icon={BarChart3} />
  return <div className="mt-distribution">{data.map((item) => <div className="mt-distribution-row" key={item.label}>
    <span>{item.label}</span>
    <div className="mt-distribution-track" tabIndex={0} aria-label={`${item.label} ${item.value} ${unit}`}><span style={{ width: `${item.value / peak * 100}%`, backgroundColor: item.color }} /><span className="mt-chart-tooltip" aria-hidden="true">{item.value} {unit}</span></div>
    <strong>{item.value}</strong>
  </div>)}</div>
}

function ActivityChart({ data }: { data: SeriesPoint[] }) {
  const peak = Math.max(1, ...data.map((item) => item.value))
  return <div className="mt-activity-chart" aria-label="กราฟจำนวนคำขอตามเวลา">
    {data.map((item) => <div className="mt-chart-column" key={item.label}>
      <div className="mt-chart-bar" role="img" tabIndex={0} aria-label={`${item.label} มี ${item.value} คำขอ`}><span style={{ height: `${item.value ? Math.max(8, item.value / peak * 100) : 2}%` }} /><span className="mt-chart-tooltip" aria-hidden="true">{item.value} คำขอ</span></div>
      <small>{item.label}</small>
    </div>)}
  </div>
}

function counted<T extends string>(values: T[], labels?: Record<T, string>) {
  const counts = new Map<T, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ label: labels?.[key] ?? key, value }))
}

function selectedDate(value: string, start: string, end: string) {
  const date = value.length === 10 ? value : dateKey(new Date(value))
  return (!start || date >= start) && (!end || date <= end)
}

function aggregatePeriod(end: string, period: 'week' | 'month', requestDates: string[]) {
  const endDay = new Date(`${end || dateKey()}T12:00:00+07:00`)
  const size = period === 'week' ? 1 : 7
  const groups = period === 'week' ? 7 : 4
  return Array.from({ length: groups }, (_, index) => {
    const last = new Date(+endDay - (groups - index - 1) * size * 86_400_000)
    const first = new Date(+last - (size - 1) * 86_400_000)
    const start = dateKey(first)
    const finish = dateKey(last)
    const label = size > 1 ? `${dateLabel(start)} – ${dateLabel(finish)}` : dateLabel(finish)
    return { label, value: requestDates.filter((date) => date >= start && date <= finish).length }
  })
}

function quoteCsv(value: string | number) {
  const text = String(value)
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replaceAll('"', '""')}"`
}

export function Analytics() {
  const { state, toast } = useDemo()
  const [start, setStart] = useState(offsetDate(-29))
  const [end, setEnd] = useState(offsetDate(0))
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [preview, setPreview] = useState(false)
  const valid = !start || !end || start <= end
  const requests = valid ? requestsFor(state, 'teacher').filter((row) => selectedDate(row.createdAt, start, end)) : []
  const appointments = valid ? appointmentsFor(state, 'teacher').filter((row) => selectedDate(row.createdAt, start, end)) : []
  const followUps = valid ? state.followUps.filter((row) => row.teacherId === state.teacherId && selectedDate(row.createdAt, start, end)) : []
  const completed = followUps.filter((row) => row.completed).length
  const responseTimes = requests.flatMap((row) => row.acceptedAt ? [Math.max(0, +new Date(row.acceptedAt) - +new Date(row.createdAt))] : [])
  const responseMinutes = responseTimes.length ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 60_000) : null
  const response = responseMinutes === null ? '—' : responseMinutes < 60 ? `${responseMinutes} นาที` : `${Math.round(responseMinutes / 60 * 10) / 10} ชม.`
  const statuses = counted(requests.map((row) => row.status), requestStatus)
  const preferences = counted(requests.map((row) => row.preference))
  const appointmentCounts = counted(appointments.map((row) => row.status), appointmentStatus)
  const activity = aggregatePeriod(end, period, requests.map((request) => dateKey(new Date(request.createdAt))))
  const metrics = [
    { label: 'คำขอความช่วยเหลือ', value: requests.length, icon: HeartHandshake, color: 'purple' },
    { label: 'นัดหมายที่บันทึก', value: appointments.length, icon: CalendarDays, color: 'blue' },
    { label: 'ติดตามผลแล้ว', value: `${completed}/${followUps.length}`, icon: CircleCheck, color: 'mint' },
    { label: 'เวลารับคำขอเฉลี่ย (จำลอง)', value: response, icon: Clock3, color: 'pink' },
  ]

  function exportReport() {
    const rows: (string | number)[][] = [
      ['ข้อมูลสมมติสำหรับการสาธิต', 'รายงานรวม MindBridge'],
      ['วันที่เริ่มต้น', start], ['วันที่สิ้นสุด', end],
      ...metrics.map(({ label, value }) => [label, value]),
      ...statuses.map(({ label, value }) => [`สถานะคำขอ · ${label}`, value]),
      ...preferences.map(({ label, value }) => [`ความช่วยเหลือ · ${label}`, value]),
      ...appointmentCounts.map(({ label, value }) => [`สถานะนัดหมาย · ${label}`, value]),
    ]
    const url = URL.createObjectURL(new Blob(['\uFEFF', rows.map((row) => row.map(quoteCsv).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'mindbridge-demo-report.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 500)
    toast('ดาวน์โหลดรายงานรวมสมมติแล้ว')
  }

  return <div className="mb-teacher-tools">
    <ToolHeading icon={BarChart3} label="รายงานการดูแล" title="ภาพรวมการช่วยเหลือ" description="ดูคำขอ นัดหมาย และการติดตามผลจากกิจกรรมในเดโม" action={<button className="mt-button mt-button--primary" type="button" disabled={!valid} onClick={() => setPreview(!preview)}><Printer size={17} aria-hidden="true" /> ดูตัวอย่างรายงาน</button>} />
    <ToolNotice>ข้อมูลสมมติสำหรับการสาธิต</ToolNotice>
    <ToolSection title="ช่วงข้อมูลที่ต้องการดู">
      <div className="mt-form mt-form--inline"><label>วันที่เริ่มต้น <input type="date" value={start} onChange={(event) => setStart(event.currentTarget.value)} /></label><label>วันที่สิ้นสุด <input type="date" value={end} onChange={(event) => setEnd(event.currentTarget.value)} /></label><button type="button" className="mt-button" onClick={() => { setStart(offsetDate(-29)); setEnd(offsetDate(0)) }}>ย้อนหลัง 30 วัน</button></div>
      {!valid && <p role="alert" className="mt-form-error">วันที่สิ้นสุดต้องอยู่หลังหรือเป็นวันเดียวกับวันที่เริ่มต้น</p>}
    </ToolSection>
    {preview && valid && <ToolSection className="mt-print-report" title="รายงานรวม MindBridge" description={`ข้อมูลสมมติสำหรับการสาธิต · ${start ? dateLabel(start) : 'ทุกวัน'} ถึง ${end ? dateLabel(end) : 'ทุกวัน'}`} action={<button type="button" className="mt-button mt-button--icon mt-no-print" aria-label="ปิดตัวอย่างรายงาน" onClick={() => setPreview(false)}><X size={18} aria-hidden="true" /></button>}>
      <dl className="mt-data-list">{metrics.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="mt-columns">
        {statuses.length > 0 && <div><h3>สถานะคำขอ</h3><dl className="mt-data-list">{statuses.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}
        {appointmentCounts.length > 0 && <div><h3>สถานะนัดหมาย</h3><dl className="mt-data-list">{appointmentCounts.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}
      </div>
      <div className="mt-actions mt-no-print"><button type="button" className="mt-button mt-button--primary" onClick={() => window.print()}><Printer size={17} aria-hidden="true" /> พิมพ์รายงาน</button><button type="button" className="mt-button" onClick={exportReport}><Download size={17} aria-hidden="true" /> ดาวน์โหลดข้อมูลรวม</button></div>
    </ToolSection>}
    {valid && <>
      <div className="mt-metric-grid">{metrics.map(({ label, value, icon: Icon, color }) => <article className="mt-card mt-metric" key={label}><span className={`mt-icon mt-icon--${color}`}><Icon size={21} aria-hidden="true" /></span><strong>{value}</strong><span>{label}</span></article>)}</div>
      <ToolSection title="กิจกรรมการขอความช่วยเหลือ" description="จำนวนคำขอที่ส่งในแต่ละช่วง" action={<div className="mt-tabs" aria-label="ช่วงเวลาในกราฟ"><button className="mt-tab" type="button" aria-pressed={period === 'week'} onClick={() => setPeriod('week')}>รายสัปดาห์</button><button className="mt-tab" type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>รายเดือน</button></div>}>
        <ActivityChart data={activity} />
      </ToolSection>
      <div className="mt-columns">
        <ToolSection title="สถานะคำขอ"><Distribution data={statuses} unit="คำขอ" /></ToolSection>
        <ToolSection title="ความช่วยเหลือที่นักเรียนเลือก"><Distribution data={preferences} unit="คำขอ" /></ToolSection>
        <ToolSection title="สถานะนัดหมาย"><Distribution data={appointmentCounts} unit="นัด" /></ToolSection>
        <ToolSection title="ความคืบหน้าการติดตามผล" action={<span className="mt-icon mt-icon--mint"><Activity size={20} aria-hidden="true" /></span>}>
          <Distribution data={followUps.length ? [{ label: 'ติดตามแล้ว', value: completed, color: '#5c9a76' }, { label: 'รอติดตาม', value: followUps.length - completed }] : []} unit="รายการ" />
        </ToolSection>
      </div>
    </>}
  </div>
}
