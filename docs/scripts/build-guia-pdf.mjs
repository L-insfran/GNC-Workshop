/**
 * Genera HTML + PDF de la guía de usuario (sin dependencias npm).
 * Uso: node docs/scripts/build-guia-pdf.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = join(__dirname, '..')
const outDir = join(docsDir, 'pdf')
const htmlPath = join(outDir, 'guia-usuario.html')
const pdfPath = join(outDir, 'GNC-Workshop-Guia-de-Usuario.pdf')

const sources = [
  { file: 'guia-usuario.md', title: null },
  { file: 'guia-usuario/README.md', title: 'Guías por rol — Índice' },
  { file: 'guia-usuario/recepcion.md', title: null },
  { file: 'guia-usuario/mecanico.md', title: null },
  { file: 'guia-usuario/caja.md', title: null },
  { file: 'guia-usuario/deposito.md', title: null },
  { file: 'guia-usuario/supervisor.md', title: null },
  { file: 'guia-usuario/administrador.md', title: null },
]

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inlineFormat(text) {
  let s = escapeHtml(text)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
  return s
}

function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0
  let inList = false
  let listTag = 'ul'
  let inTable = false

  const closeList = () => {
    if (inList) {
      out.push(`</${listTag}>`)
      inList = false
    }
  }

  const closeTable = () => {
    if (inTable) {
      out.push('</tbody></table>')
      inTable = false
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      closeList()
      closeTable()
      i++
      continue
    }

    if (line.trim() === '---') {
      closeList()
      closeTable()
      out.push('<hr />')
      i++
      continue
    }

    const h = line.match(/^(#{1,4})\s+(.+)$/)
    if (h) {
      closeList()
      closeTable()
      const level = h[1].length
      out.push(`<h${level}>${inlineFormat(h[2])}</h${level}>`)
      i++
      continue
    }

    if (line.trim().startsWith('> ')) {
      closeList()
      closeTable()
      const quoteLines = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      out.push(`<blockquote><p>${inlineFormat(quoteLines.join(' '))}</p></blockquote>`)
      continue
    }

    if (line.includes('|') && line.trim().startsWith('|')) {
      closeList()
      const rows = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        const cells = lines[i]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim())
        rows.push(cells)
        i++
      }
      if (rows.length >= 2 && rows[1].every((c) => /^:?-+:?$/.test(c))) {
        const header = rows[0]
        const body = rows.slice(2)
        out.push('<table><thead><tr>')
        header.forEach((c) => out.push(`<th>${inlineFormat(c)}</th>`))
        out.push('</tr></thead><tbody>')
        body.forEach((row) => {
          out.push('<tr>')
          row.forEach((c) => out.push(`<td>${inlineFormat(c)}</td>`))
          out.push('</tr>')
        })
        out.push('</tbody></table>')
      }
      continue
    }

    const ol = line.match(/^\d+\.\s+(.+)$/)
    if (ol) {
      closeTable()
      if (!inList || listTag !== 'ol') {
        closeList()
        listTag = 'ol'
        out.push('<ol>')
        inList = true
      }
      out.push(`<li>${inlineFormat(ol[1])}</li>`)
      i++
      continue
    }

    const ul = line.match(/^[-*]\s+(.+)$/)
    if (ul) {
      closeTable()
      if (!inList || listTag !== 'ul') {
        closeList()
        listTag = 'ul'
        out.push('<ul>')
        inList = true
      }
      const check = ul[1].match(/^\[([ xX])\]\s+(.+)$/)
      if (check) {
        const checked = check[1].toLowerCase() === 'x' ? '☑' : '☐'
        out.push(`<li class="check">${checked} ${inlineFormat(check[2])}</li>`)
      } else {
        out.push(`<li>${inlineFormat(ul[1])}</li>`)
      }
      i++
      continue
    }

    closeList()
    closeTable()
    out.push(`<p>${inlineFormat(line)}</p>`)
    i++
  }

  closeList()
  closeTable()
  return out.join('\n')
}

const css = `
  @page { margin: 18mm 16mm; size: A4; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #1e293b;
    max-width: 180mm;
    margin: 0 auto;
    padding: 8mm 0;
  }
  .cover {
    page-break-after: always;
    min-height: 240mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20mm 10mm;
    border-top: 6px solid #0f172a;
  }
  .cover .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 9pt;
    color: #64748b;
    margin-bottom: 12px;
  }
  .cover h1 {
    font-size: 28pt;
    margin: 0 0 8px;
    color: #0f172a;
    border: none;
    padding: 0;
  }
  .cover .subtitle {
    font-size: 13pt;
    color: #475569;
    margin: 0 0 28px;
  }
  .cover .meta {
    font-size: 9.5pt;
    color: #64748b;
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
    margin-top: 24px;
  }
  .section-break { page-break-before: always; }
  h1 {
    font-size: 18pt;
    color: #0f172a;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 6px;
    margin-top: 0;
  }
  h2 {
    font-size: 13pt;
    color: #0f172a;
    margin-top: 22px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    color: #334155;
    margin-top: 16px;
    page-break-after: avoid;
  }
  h4 { font-size: 10.5pt; color: #475569; }
  p { margin: 6px 0 10px; }
  ul, ol { margin: 6px 0 12px; padding-left: 22px; }
  li { margin: 3px 0; }
  li.check { list-style: none; margin-left: -18px; }
  strong { color: #0f172a; }
  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 9pt;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
  }
  a { color: #1d4ed8; text-decoration: none; }
  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 22px 0;
  }
  blockquote {
    margin: 12px 0;
    padding: 8px 14px;
    border-left: 4px solid #0f172a;
    background: #f8fafc;
    color: #334155;
  }
  blockquote p { margin: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #0f172a;
    color: #fff;
    font-weight: 600;
  }
  tr:nth-child(even) td { background: #f8fafc; }
  .footer-note {
    margin-top: 28px;
    font-size: 8.5pt;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
  }
`

function buildHtml() {
  const parts = []
  parts.push(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>GNC Workshop — Guía de usuario</title>
  <style>${css}</style>
</head>
<body>
  <section class="cover">
    <div class="eyebrow">Manual operativo</div>
    <h1>GNC Workshop</h1>
    <p class="subtitle">Guía de usuario del sistema de gestión para talleres de GNC</p>
    <p>Incluye la guía completa de módulos y las guías rápidas por rol: recepción, mecánico, caja, depósito, supervisor y administrador.</p>
    <div class="meta">
      <div>Documento para personal del taller</div>
      <div>Sin detalles técnicos — uso diario</div>
    </div>
  </section>
`)

  for (let idx = 0; idx < sources.length; idx++) {
    const src = sources[idx]
    const raw = readFileSync(join(docsDir, src.file), 'utf8')
    // Quitar el bloque de enlace a guía completa / índice redundante en portada interna
    let body = raw
    if (src.title) {
      body = `# ${src.title}\n\n` + raw.replace(/^#[^\n]+\n+/, '')
    }
    const cls = idx === 0 ? '' : ' class="section-break"'
    parts.push(`<section${cls}>\n${markdownToHtml(body)}\n</section>`)
  }

  parts.push(`
  <p class="footer-note">GNC Workshop Management System — Guía de usuario. Documento interno del taller.</p>
</body>
</html>`)

  return parts.join('\n')
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean)

  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  return null
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const html = buildHtml()
writeFileSync(htmlPath, html, 'utf8')
console.log('HTML:', htmlPath)

const chrome = findChrome()
if (!chrome) {
  console.error('No se encontró Chrome ni Edge. Abrí el HTML e imprimí a PDF manualmente.')
  process.exit(1)
}

const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/')
const result = spawnSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    '--print-to-pdf-no-header',
    fileUrl,
  ],
  { encoding: 'utf8', timeout: 90000 },
)

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'Error al generar PDF')
  process.exit(result.status ?? 1)
}

if (!existsSync(pdfPath)) {
  console.error('Chrome terminó pero no se generó el PDF.')
  process.exit(1)
}

console.log('PDF:', pdfPath)
