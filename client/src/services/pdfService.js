/**
 * MusicLearn PDF Service
 * Generates student progress reports using jsPDF + jspdf-autotable
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const INSTRUMENT_LABELS = { guitar:'Guitarra Acústica', bass:'Bajo Eléctrico', piano:'Piano', vocal:'Técnica Vocal' }
const LEVEL_LABELS = { beginner:'Principiante', intermediate:'Intermedio', advanced:'Avanzado' }

export async function generateStudentReport(student) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const pageW = 210
  const margin = 20
  const contentW = pageW - margin * 2
  let y = margin

  // ── HEADER ──
  // Dark header bar
  doc.setFillColor(10, 10, 15)
  doc.rect(0, 0, pageW, 38, 'F')

  // Logo / brand
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(200, 149, 108)
  doc.text('♪ MusicLearn', margin, 18)

  doc.setFontSize(9)
  doc.setTextColor(180, 180, 180)
  doc.text('Bogotá, Colombia · musiclearn.co', margin, 26)

  doc.setFontSize(11)
  doc.setTextColor(240, 238, 232)
  doc.text('Reporte de Progreso Estudiantil', pageW - margin, 22, { align:'right' })
  doc.setFontSize(8)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}`, pageW - margin, 30, { align:'right' })

  y = 52

  // ── STUDENT INFO ──
  doc.setFillColor(26, 26, 36)
  doc.roundedRect(margin, y, contentW, 32, 4, 4, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(240, 238, 232)
  doc.text(student.name, margin + 8, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 180, 180)
  doc.text(`${INSTRUMENT_LABELS[student.instrument] || student.instrument} · Nivel ${LEVEL_LABELS[student.level] || student.level} · ${student.modality === 'virtual' ? 'Virtual' : 'Presencial'}`, margin + 8, y + 18)
  doc.text(`Inscripción: ${student.joinDate || 'N/A'} · Última clase: ${student.lastClass || 'N/A'}`, margin + 8, y + 25)

  y += 42

  // ── KPI BOXES ──
  const kpis = [
    { label:'Progreso', value:`${student.progress || 0}%` },
    { label:'Asistencia', value:`${student.attendance || 0}%` },
    { label:'Clases', value:`${student.completedClasses || 0}/${student.totalClasses || 0}` },
    { label:'Meta', value: student.goal || '—' },
  ]
  const kpiW = (contentW - 9) / 4

  kpis.forEach((kpi, i) => {
    const x = margin + i * (kpiW + 3)
    doc.setFillColor(22, 22, 31)
    doc.roundedRect(x, y, kpiW, 22, 3, 3, 'F')
    doc.setFontSize(7)
    doc.setTextColor(130, 130, 130)
    doc.text(kpi.label, x + kpiW / 2, y + 7, { align:'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 149, 108)
    const valText = kpi.value.length > 10 ? kpi.value.slice(0, 10) + '…' : kpi.value
    doc.text(valText, x + kpiW / 2, y + 16, { align:'center' })
    doc.setFont('helvetica', 'normal')
  })

  y += 32

  // ── PROGRESS BAR VISUAL ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(240, 238, 232)
  doc.text('Progreso general', margin, y)
  y += 5

  const barH = 6
  doc.setFillColor(26, 26, 36)
  doc.roundedRect(margin, y, contentW, barH, 3, 3, 'F')
  const fillW = Math.round(contentW * (student.progress || 0) / 100)
  doc.setFillColor(200, 149, 108)
  doc.roundedRect(margin, y, fillW, barH, 3, 3, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(130, 130, 130)
  doc.text(`${student.progress || 0}%`, margin + contentW + 2, y + 4.5)

  y += 16

  // ── TOPICS TABLE ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(240, 238, 232)
  doc.text('Progreso por tema', margin, y)
  y += 5

  const topics = student.topics || [
    { title:'Acordes abiertos', pct:100 },
    { title:'Posición de mano', pct:100 },
    { title:'Rasgueos básicos', pct:100 },
    { title:'Escala pentatónica', pct:30 },
    { title:'Barre chords', pct:0 },
  ]

  autoTable(doc, {
    startY: y,
    head: [['Tema', 'Progreso', 'Estado']],
    body: topics.map(t => [
      t.title,
      `${t.pct}%`,
      t.pct === 100 ? '✓ Completado' : t.pct > 0 ? '⟳ En progreso' : '○ Pendiente'
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      textColor: [240, 238, 232],
      fillColor: [26, 26, 36],
      lineColor: [40, 40, 55],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [200, 149, 108],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [20, 20, 28],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' },
    },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 12

  // ── SESSION HISTORY ──
  const sessions = student.sessions || []
  if (sessions.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(240, 238, 232)
    doc.text('Historial de clases', margin, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Tema', 'Asistencia', 'Observaciones']],
      body: sessions.map(s => [
        s.date, s.topic,
        s.attended ? 'Asistió' : 'Ausente',
        s.notes || '—'
      ]),
      styles: {
        font: 'helvetica', fontSize: 8, cellPadding: 3,
        textColor: [240, 238, 232], fillColor: [26, 26, 36],
        lineColor: [40, 40, 55], lineWidth: 0.3,
      },
      headStyles: { fillColor: [26, 26, 36], textColor: [200, 149, 108], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [20, 20, 28] },
      columnStyles: {
        0: { cellWidth: 28 }, 1: { cellWidth: 50 },
        2: { cellWidth: 24, halign:'center' }, 3: { cellWidth: 60 }
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        // Color attendance column
        if (data.column.index === 2 && data.section === 'body') {
          const text = data.cell.text[0]
          if (text === 'Asistió') doc.setTextColor(92, 184, 138)
          else if (text === 'Ausente') doc.setTextColor(224, 96, 96)
        }
      }
    })

    y = doc.lastAutoTable.finalY + 12
  }

  // ── RECOMMENDATION ──
  doc.setFillColor(26, 26, 36)
  doc.roundedRect(margin, y, contentW, 28, 4, 4, 'F')
  doc.setFillColor(200, 149, 108)
  doc.roundedRect(margin, y, 4, 28, 2, 2, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(200, 149, 108)
  doc.text('Próximo paso recomendado', margin + 10, y + 9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 180, 180)
  doc.text('Continuar con la escala pentatónica — Posición 1 — 15 minutos diarios de práctica.', margin + 10, y + 17, { maxWidth: contentW - 14 })

  y += 36

  // ── FOOTER ──
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(40, 40, 55)
  doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
  doc.setFontSize(7.5)
  doc.setTextColor(100, 100, 100)
  doc.text('MusicLearn · Bogotá, Colombia · musiclearn.co', margin, pageH - 11)
  doc.text('Este reporte es confidencial y de uso exclusivo del estudiante y su tutor.', pageW - margin, pageH - 11, { align:'right' })

  // Save
  doc.save(`Reporte_${student.name.replace(/\s+/g,'_')}_MusicLearn.pdf`)
}
