import { expect, test } from '@playwright/test';

test('decoder transfers a selected emotion into editable private check-ins', async ({ page }) => {
  await page.goto('./#/student/emotion-decoder');
  await page.locator('.rf-wheel').getByRole('button', { name: 'ความเศร้า' }).click();
  await page.getByRole('button', { name: 'ผิดหวัง', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ผิดหวัง', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'เพิ่มในเช็กอิน' }).click();
  await expect(page.getByRole('button', { name: 'ผิดหวัง', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'บันทึกเช็กอิน' }).click();

  const record = page.locator('.rf-history-row').filter({ hasText: 'ผิดหวัง' });
  await expect(record).toHaveCount(1);
  await record.getByRole('button', { name: 'แก้ไขเช็กอิน' }).click();
  await page.getByRole('button', { name: 'สบายใจ', exact: true }).click();
  await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();
  await expect(record).toContainText('สบายใจ');

  await page.getByRole('link', { name: 'ประวัติความรู้สึก' }).click();
  await page.getByRole('combobox', { name: 'ความรู้สึก', exact: true }).selectOption('ผิดหวัง');
  await expect(page.getByRole('button', { name: /ผิดหวัง · สบายใจ/ })).toBeVisible();
  await page.getByRole('link', { name: 'เช็กอิน', exact: true }).click();
  await record.getByRole('button', { name: 'ลบเช็กอิน' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'ลบเช็กอิน' }).click();
  await expect(record).toHaveCount(0);
});

test('canvas undo and redo affect an image that can be attached to a journal', async ({ page }) => {
  await page.goto('./#/student/drawing');
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('กระดานวาดไม่มีขนาด');
  const getDrawing = () => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  const before = await getDrawing();
  await page.mouse.move(box.x + box.width * .25, box.y + box.height * .3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .68, box.y + box.height * .7, { steps: 12 });
  await page.mouse.up();
  const after = await getDrawing();
  expect(after).not.toEqual(before);
  await page.getByRole('button', { name: 'เลิกทำ' }).click();
  expect(await getDrawing()).toEqual(before);
  await page.getByRole('button', { name: 'ทำซ้ำ' }).click();
  expect(await getDrawing()).toEqual(after);

  await page.getByLabel('ชื่อภาพ').fill('เส้นทดลอง');
  await page.getByRole('button', { name: 'เก็บและแนบในบันทึก' }).click();
  await expect(page.getByRole('img', { name: 'เส้นทดลอง' })).toBeVisible();
  await page.getByLabel('ชื่อเรื่อง').fill('ภาพจากกระดานวาด');
  await page.getByRole('button', { name: 'บันทึกส่วนตัว', exact: true }).click();
  await expect(page.getByText('ภาพจากกระดานวาด', { exact: true })).toBeVisible();
});

test('journal draft, edit and excerpt review keep the original private', async ({ page }) => {
  await page.goto('./#/student/journal');
  await page.getByLabel('ชื่อเรื่อง').fill('สมุดสาธิตแบบส่วนตัว');
  await page.getByLabel('สิ่งที่อยากบันทึก').fill('ส่วนที่อยากให้ครูเห็น\nส่วนนี้เก็บไว้เฉพาะฉัน');
  await page.getByRole('button', { name: 'เก็บฉบับร่าง' }).click();

  const record = page.locator('.rf-journal-record').filter({ hasText: 'สมุดสาธิตแบบส่วนตัว' });
  await expect(record).toContainText('ฉบับร่าง');
  await record.getByRole('button', { name: 'แก้ไขบันทึก' }).click();
  await expect(page.getByLabel('สิ่งที่อยากบันทึก')).toHaveValue('ส่วนที่อยากให้ครูเห็น\nส่วนนี้เก็บไว้เฉพาะฉัน');
  await page.getByRole('button', { name: 'บันทึกส่วนตัว', exact: true }).click();
  await expect(record).not.toContainText('ฉบับร่าง');

  await record.getByRole('button', { name: 'เลือกข้อความจากบันทึกเพื่อแชร์' }).click();
  await page.getByLabel('ข้อความที่จะส่งให้ครู').fill('ส่วนที่อยากให้ครูเห็น');
  await page.getByRole('button', { name: 'ตรวจทานก่อนแชร์' }).click();
  const review = page.getByRole('dialog', { name: 'ตรวจทานก่อนแชร์' });
  await expect(review).toContainText('ส่วนที่อยากให้ครูเห็น');
  await expect(review).not.toContainText('ส่วนนี้เก็บไว้เฉพาะฉัน');
  await review.getByRole('combobox', { name: 'ผู้ที่จะได้รับข้อมูล' }).selectOption('teacher-ploy');
  await review.getByRole('checkbox').check();
  await review.getByRole('button', { name: 'ยืนยันแชร์ในโหมดสาธิต' }).click();
  await expect(review).toHaveCount(0);
  await expect(record).toBeVisible();

  await page.getByRole('button', { name: 'โหมดสาธิต', exact: true }).click();
  await page.getByRole('button', { name: 'สลับไปบัญชีครู' }).click();
  await page.getByRole('link', { name: 'นักเรียนในความดูแล', exact: true }).click();
  await page.getByRole('link', { name: 'เปิดข้อมูลการดูแลของฟ้า' }).click();
  await expect(page.getByText('ส่วนที่อยากให้ครูเห็น', { exact: true })).toBeVisible();
  await expect(page.getByText('ส่วนนี้เก็บไว้เฉพาะฉัน')).toHaveCount(0);
  await expect(page.getByText('สมุดสาธิตแบบส่วนตัว')).toHaveCount(0);
});

test('Trust Ladder opens the private recording demo and the sample audio loads', async ({ page }) => {
  await page.goto('./#/student/trust-ladder');
  await page.getByRole('button', { name: /REFLECT/ }).click();
  await page.getByRole('link', { name: 'บันทึกเสียงชั่วคราว' }).click();
  await page.getByRole('button', { name: 'ใช้ตัวอย่างเสียงสาธิต' }).click();
  await expect(page.getByText('บันทึกเสียงสมมติ', { exact: true })).toBeVisible();
  await expect.poll(() => page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.duration)).toBeCloseTo(5);
  await page.getByRole('button', { name: 'ลบบันทึกเสียง' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'ลบเสียง' }).click();
  await expect(page.locator('audio')).toHaveCount(0);
});

test('reflection pages fit mobile and tablet widths without horizontal scrolling', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    for (const route of ['emotions', 'emotion-decoder', 'journal', 'drawing', 'trust-ladder']) {
      await page.goto(`./#/student/${route}`);
      await expect(page.locator('.rf-page h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
  expect(errors).toEqual([]);
});

test('captures and plays an in-memory recording from a synthetic audio stream', async ({ page }) => {
  await page.addInitScript(() => {
    // Exercise the native recorder with a deterministic input without invoking system microphone permissions.
    navigator.mediaDevices.getUserMedia = async () => {
      const audio = new AudioContext()
      await audio.resume()
      const destination = audio.createMediaStreamDestination()
      const tone = audio.createOscillator()
      tone.connect(destination)
      tone.start()
      return destination.stream
    }
  })
  await page.goto('./#/student/voice')
  await page.getByRole('button', { name: 'เริ่มบันทึกเสียง' }).click()
  await expect(page.getByRole('heading', { name: 'กำลังบันทึกเสียง' })).toBeVisible()
  await expect(page.getByText('บันทึกแล้ว 1 วินาที จาก 60 วินาที')).toBeVisible()
  await page.getByRole('button', { name: 'หยุดบันทึก' }).click()
  const player = page.locator('audio[aria-label="เสียงบันทึกของฉัน"]')
  await expect(player).toBeVisible()
  expect(await player.getAttribute('src')).toMatch(/^blob:/)
  await player.evaluate(async (audio: HTMLAudioElement) => { await audio.play(); audio.pause() })
  await page.reload()
  await expect(player).toHaveCount(0)
})
