const router  = require('express').Router()
const { authMiddleware, requireRole } = require('../middleware/authMiddleware')

// Server-side report generation (Puppeteer)
// Falls back gracefully if Puppeteer not available
router.get('/student/:studentId', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    let puppeteer
    try { puppeteer = require('puppeteer') } catch { /* not installed */ }

    if (!puppeteer) {
      return res.status(503).json({
        message: 'PDF server-side no disponible. Usa la generación desde el cliente.',
        fallback: 'client'
      })
    }

    const { studentId } = req.params
    // In production: fetch real student data from DB
    const studentData = { id: studentId, name: 'Estudiante', progress: 75 }

    const html = generateReportHTML(studentData)

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] })
    const page    = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top:'20mm', bottom:'20mm', left:'20mm', right:'20mm' } })
    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="Reporte_${studentId}.pdf"`)
    res.send(pdf)
  } catch (err) {
    console.error('PDF generation error:', err)
    res.status(500).json({ message: 'Error al generar PDF' })
  }
})

function generateReportHTML(student) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', sans-serif; color: #1a1a1a; background: #fff; }
    .header { background: #0a0a0f; color: #fff; padding: 24px 32px; }
    .brand { font-size: 20px; font-weight: 700; color: #c8956c; margin-bottom: 4px; }
    .title { font-size: 13px; color: #aaa; }
    .body { padding: 32px; }
    .student-name { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    .kpi-row { display: flex; gap: 16px; margin: 24px 0; }
    .kpi { flex: 1; background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-val { font-size: 24px; font-weight: 700; color: #c8956c; }
    .kpi-lbl { font-size: 11px; color: #666; margin-top: 4px; }
    .section-title { font-size: 13px; font-weight: 700; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: .05em; color: #666; }
    .progress-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .progress-label { width: 150px; font-size: 13px; }
    .progress-bar { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #c8956c; border-radius: 4px; }
    .progress-pct { width: 36px; font-size: 12px; text-align: right; font-weight: 600; }
    .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 32px; font-size: 10px; color: #999; border-top: 1px solid #eee; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">♪ MusicLearn</div>
    <div class="title">Reporte de Progreso · ${new Date().toLocaleDateString('es-CO')}</div>
  </div>
  <div class="body">
    <div class="student-name">${student.name}</div>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-val">${student.progress}%</div><div class="kpi-lbl">Progreso</div></div>
      <div class="kpi"><div class="kpi-val">89%</div><div class="kpi-lbl">Asistencia</div></div>
      <div class="kpi"><div class="kpi-val">16/18</div><div class="kpi-lbl">Clases</div></div>
    </div>
    <div class="section-title">Progreso por tema</div>
    ${[
      ['Acordes abiertos', 100], ['Posición de mano', 100],
      ['Rasgueos básicos', 100], ['Escala pentatónica', 30], ['Barre chords', 0]
    ].map(([t, p]) => `
      <div class="progress-row">
        <div class="progress-label">${t}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div>
        <div class="progress-pct">${p}%</div>
      </div>`).join('')}
  </div>
  <div class="footer">
    <span>MusicLearn · Bogotá, Colombia</span>
    <span>Generado: ${new Date().toLocaleDateString('es-CO')}</span>
  </div>
</body>
</html>`
}

module.exports = router
