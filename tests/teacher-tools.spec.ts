import { expect, test } from '@playwright/test'

test('a teacher sees shared excerpts until the student revokes future access', async ({ page }) => {
  await page.goto('./#/teacher/students?student=student-fah')
  const excerpt = 'อยากลองเผื่อเวลาพักแบบนี้ก่อนเริ่มอ่านหนังสือ'
  await expect(page.getByRole('heading', { name: 'ฟ้า', exact: true })).toBeVisible()
  await expect(page.getByText(excerpt, { exact: true })).toBeVisible()
  await expect(page.getByText(/เป็นช่วงเงียบ ๆ ที่อยากเก็บให้ตัวเอง/)).toHaveCount(0)

  await page.goto('./#/student/settings?tab=privacy')
  await page.getByText('ข้อความที่ฟ้าเลือกแบ่งปัน', { exact: true }).click()
  await page.getByRole('button', { name: 'ยกเลิกการแชร์', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'ยกเลิกการแชร์', exact: true }).click()
  await expect(page.getByText('ยกเลิกการแชร์แล้ว', { exact: true })).toBeVisible()

  await page.goto('./#/teacher/students?student=student-fah')
  await expect(page.getByRole('heading', { name: 'ฟ้า', exact: true })).toBeVisible()
  await expect(page.getByText(excerpt, { exact: true })).toHaveCount(0)
  await page.goto('./#/teacher/settings')
  await page.getByLabel('เลือกโปรไฟล์คุณครู').selectOption('teacher-may')
  await page.goto('./#/teacher/students?student=student-fah')
  await expect(page.getByRole('heading', { name: 'เปิดข้อมูลนักเรียนไม่ได้' })).toBeVisible()
})

test('teacher guidance loads an editable reply without sending it', async ({ page }) => {
  await page.goto('./#/teacher/guidance?conversation=chat-fah')
  const card = page.locator('.mt-guidance-topic').filter({ hasText: 'การรับฟังอย่างตั้งใจ' })
  await card.locator('summary').click()
  await card.getByRole('button', { name: 'ใช้ในข้อความ' }).click()

  await expect(page).toHaveURL(/#\/teacher\/messages\?id=chat-fah$/)
  const input = page.getByRole('textbox', { name: 'พิมพ์ข้อความ' })
  await expect(input).toHaveValue(/ขอบคุณที่ไว้ใจเล่าให้ครูฟังนะ/)
  const reply = 'เราลองเริ่มจากเรื่องที่ฟ้าอยากให้ครูฟังก่อนได้นะ'
  await expect(page.getByText(reply, { exact: true })).toHaveCount(0)
  await input.fill(reply)
  await page.getByRole('button', { name: 'ส่งข้อความ', exact: true }).click()

  await page.goto('./#/student/messages?id=chat-fah')
  await expect(page.locator('.wf-chat-thread').getByText(reply, { exact: true })).toBeVisible()
})

test('teacher availability and reply estimates update the student directory', async ({ page }) => {
  await page.goto('./#/teacher/availability')
  await page.getByLabel('เปิดให้นักเรียนเลือกเวลานัด').uncheck()
  await page.getByLabel('เวลาตอบกลับโดยประมาณในเดโม').fill('ภายใน 3 วันเรียน')
  await page.getByRole('button', { name: 'บันทึกเวลาที่สะดวก' }).click()
  await expect(page.getByText('อัปเดตเวลาที่สะดวกแล้ว', { exact: true })).toBeVisible()

  await page.goto('./#/student/teachers')
  const card = page.locator('article').filter({ hasText: 'ครูพลอย' })
  await expect(card.getByText('พักรับนัดหมาย', { exact: true })).toBeVisible()
  await expect(card.getByText(/ภายใน 3 วันเรียน/)).toBeVisible()
})

test('the student receives a care plan and only the teacher note marked visible', async ({ page }) => {
  const goal = 'ทดลองจัดเวลาพักก่อนกลับมาอ่านหนังสือ'
  const task = 'ลองใช้ช่วงพักสิบนาที'
  const privateNote = 'ร่างสำหรับครูเท่านั้นในเดโม'
  const studentNote = 'ครั้งหน้าเรามาทบทวนกันว่าช่วงพักช่วยได้อย่างไร'

  await page.goto('./#/teacher/care?request=request-fah&panel=plan')
  await page.getByLabel('เป้าหมายการดูแล').fill(goal)
  await page.getByRole('button', { name: 'เพิ่มรายการ' }).click()
  await page.getByLabel('รายการที่ 1', { exact: true }).fill(task)
  await page.getByRole('button', { name: 'สร้างแผนการดูแล', exact: true }).click()
  const savedPlan = page.locator('.mt-record').filter({ hasText: goal })
  await expect(savedPlan).toBeVisible()
  await savedPlan.getByRole('checkbox', { name: task }).check()

  await page.getByRole('button', { name: 'บันทึกของครู', exact: true }).click()
  const editor = page.getByRole('textbox', { name: 'ข้อความ', exact: true })
  await editor.fill(privateNote)
  await page.getByRole('button', { name: 'บันทึกการดูแล', exact: true }).click()
  await editor.fill(studentNote)
  await page.getByLabel('ใครจะเห็นบันทึกนี้').selectOption('student')
  await page.getByRole('button', { name: 'บันทึกการดูแล', exact: true }).click()

  await page.goto('./#/student/journey?id=request-fah')
  const studentPlan = page.locator('section').filter({ has: page.getByRole('heading', { name: 'แผนการดูแลร่วมกัน' }) })
  await expect(studentPlan.getByText(goal, { exact: true })).toBeVisible()
  await expect(studentPlan.getByText('✓ ' + task, { exact: true })).toBeVisible()
  await expect(page.getByText(studentNote, { exact: true })).toBeVisible()
  await expect(page.getByText(privateNote, { exact: true })).toHaveCount(0)
})

test('the aggregate report previews and exports without listing student names', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => { document.documentElement.dataset.printInvoked = 'true' }
  })
  await page.goto('./#/teacher/reports')
  await expect(page.getByText('ข้อมูลสมมติสำหรับการสาธิต', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'รายเดือน' }).click()
  await expect(page.getByRole('button', { name: 'รายเดือน' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'ดูตัวอย่างรายงาน' }).click()
  await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-print-invoked', 'true')
  const report = page.locator('.mt-print-report')
  await expect(report.getByRole('heading', { name: 'รายงานรวม MindBridge' })).toBeVisible()
  for (const name of ['ฟ้า', 'น้ำ', 'วิน']) await expect(report.getByText(name, { exact: true })).toHaveCount(0)

  const downloaded = page.waitForEvent('download')
  await report.getByRole('button', { name: 'ดาวน์โหลดข้อมูลรวม' }).click()
  expect((await downloaded).suggestedFilename()).toBe('mindbridge-demo-report.csv')
})
