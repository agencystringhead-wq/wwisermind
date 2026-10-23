import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { formatMoney, longDate, priceRows, shortDate, type Estimate } from './estimate';
import {
  DETAIL_INTRO,
  DISCLAIMER,
  DISCLAIMER_HEADING,
  FOOTER_LINE,
  GFE_TITLE,
  OFFICIAL_FORM_NOTE,
  SELF_PAY_NOTE,
  SEPARATE_PROVIDERS_HEADING,
  SEPARATE_PROVIDERS_NOTE,
  VALID_12_MONTHS,
} from './legal';

/* Builds the estimate PDF in the browser with pdf-lib. Nothing here touches the network: the bytes go straight to a download.
   The layout follows the CMS standard form: patient, summary of expected charges, the provider's estimate with the itemized table,
   items booked elsewhere, then the disclaimer. */

const W = 612;
const H = 792;
const M = 54; // page margin
const INK = rgb(0.07, 0.07, 0.07);
const MUTED = rgb(0.35, 0.35, 0.35);
const LINE = rgb(0.82, 0.82, 0.8);
const BAND = rgb(0.95, 0.95, 0.94);
const BLUE = rgb(0.08, 0.43, 0.96);

class Writer {
  page!: PDFPage;
  y = 0;
  pageNo = 0;
  pages: PDFPage[] = [];
  constructor(readonly doc: PDFDocument, readonly regular: PDFFont, readonly bold: PDFFont) {
    this.newPage();
  }

  newPage() {
    this.page = this.doc.addPage([W, H]);
    this.pages.push(this.page);
    this.pageNo += 1;
    this.y = H - M;
  }

  /** Keeps a block together: starts a new page if `h` points do not fit above the footer. */
  need(h: number) {
    if (this.y - h < M + 30) this.newPage();
  }

  /** Text the standard fonts can print: anything outside their character set becomes "?" so a stray symbol cannot stop the download. */
  safe(text: string, font: PDFFont): string {
    const ok = font.getCharacterSet();
    let out = '';
    for (const ch of text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ')) {
      out += ok.includes(ch.codePointAt(0)!) ? ch : '?';
    }
    return out;
  }

  wrap(text: string, font: PDFFont, size: number, width: number): string[] {
    const words = this.safe(text, font).split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) <= width || !cur) cur = next;
      else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  text(t: string, x: number, size = 10, opts: { bold?: boolean; color?: ReturnType<typeof rgb>; right?: number } = {}) {
    const font = opts.bold ? this.bold : this.regular;
    const s = this.safe(t, font);
    const px = opts.right !== undefined ? opts.right - font.widthOfTextAtSize(s, size) : x;
    this.page.drawText(s, { x: px, y: this.y, size, font, color: opts.color ?? INK });
  }

  /** A paragraph of wrapped text; moves down by what it used. */
  para(t: string, size = 10, opts: { bold?: boolean; color?: ReturnType<typeof rgb>; width?: number; x?: number; gap?: number } = {}) {
    const font = opts.bold ? this.bold : this.regular;
    const width = opts.width ?? W - 2 * M;
    const lh = size * 1.4;
    for (const line of this.wrap(t, font, size, width)) {
      this.need(lh);
      this.y -= lh;
      this.page.drawText(line, { x: opts.x ?? M, y: this.y, size, font, color: opts.color ?? INK });
    }
    this.y -= opts.gap ?? 6;
  }

  rule(color = LINE) {
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: W - M, y: this.y }, thickness: 0.7, color });
  }

  heading(t: string, size = 11) {
    this.need(40);
    this.y -= 22;
    this.page.drawRectangle({ x: M, y: this.y - 6, width: W - 2 * M, height: 22, color: BAND });
    this.text(t, M + 8, size, { bold: true });
    this.y -= 12;
  }

  /** Label above value, in a row of columns. */
  fields(cols: { label: string; value: string; w: number }[]) {
    const size = 10;
    const wrapped = cols.map((c) => this.wrap(c.value || '-', this.regular, size, c.w - 10));
    const lines = Math.max(...wrapped.map((l) => l.length));
    const h = 14 + lines * 13 + 6;
    this.need(h);
    let x = M;
    const top = this.y;
    cols.forEach((c, i) => {
      this.y = top - 12;
      this.text(c.label, x, 8, { color: MUTED });
      wrapped[i].forEach((line, j) => {
        this.y = top - 12 - 13 * (j + 1);
        this.page.drawText(line, { x, y: this.y, size, font: this.regular, color: INK });
      });
      x += c.w;
    });
    this.y = top - h;
  }
}

export type PdfResult = { bytes: Uint8Array; fileName: string };

export async function buildGfePdf(e: Estimate): Promise<PdfResult> {
  const doc = await PDFDocument.create();
  doc.setTitle('Good Faith Estimate');
  doc.setCreator('wwisermind.com');
  doc.setProducer('wwisermind.com GFE tool');
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(doc, regular, bold);
  const { lines, totalCents } = priceRows(e.rows);
  const recurring = lines.some((l) => l.sessions > 1);
  const providerLine = [e.providerName.trim(), e.credentials.trim()].filter(Boolean).join(', ');
  const practice = e.practiceName.trim();
  const address = `${e.street.trim()}, ${e.city.trim()}, ${e.state.trim()} ${e.zip.trim()}`;
  const primary = lines[0];

  /* --- Title ------------------------------------------------------------------------------------ */
  w.y -= 14;
  w.text(practice, M, 12, { bold: true, color: BLUE });
  w.y -= 26;
  w.text(GFE_TITLE, M, 18, { bold: true });
  w.y -= 10;
  w.para(SELF_PAY_NOTE, 9, { color: MUTED, gap: 2 });

  /* --- Patient ---------------------------------------------------------------------------------- */
  w.heading('Patient');
  w.fields([
    { label: 'Patient name', value: e.clientName.trim(), w: 260 },
    { label: 'Patient date of birth', value: shortDate(e.clientDob), w: 200 },
  ]);
  if (e.clientAddress.trim()) w.fields([{ label: 'Patient address', value: e.clientAddress.trim(), w: 460 }]);
  const contact = [
    { label: 'Patient phone', value: e.clientPhone.trim(), w: 260 },
    { label: 'Patient email', value: e.clientEmail.trim(), w: 200 },
  ].filter((f) => f.value);
  if (contact.length) w.fields(contact);
  w.fields([{ label: 'Patient diagnosis code(s), if determined', value: e.diagnosis.trim() || 'Not provided', w: 460 }]);
  w.fields([
    { label: 'Primary service requested/scheduled', value: primary ? `${primary.code} ${primary.name}` : '', w: 260 },
    { label: 'Date the primary service will first be provided', value: longDate(e.firstSession), w: 200 },
  ]);
  w.fields([{ label: 'Date of Good Faith Estimate', value: longDate(e.issued), w: 460 }]);

  /* --- Summary ---------------------------------------------------------------------------------- */
  w.heading('Summary of Expected Charges');
  w.para('See the itemized estimate below for more detail.', 9, { color: MUTED, gap: 4 });
  w.need(26);
  w.y -= 16;
  w.text(providerLine || practice, M, 10);
  w.text(formatMoney(totalCents), M, 10, { right: W - M });
  w.y -= 6;
  w.rule();
  w.y -= 18;
  w.text('Total Estimated Cost', M, 11, { bold: true });
  w.text(formatMoney(totalCents), M, 11, { bold: true, right: W - M });
  w.y -= 8;

  /* --- Provider estimate ------------------------------------------------------------------------ */
  w.para(
    `${DETAIL_INTRO(primary ? `${primary.code} ${primary.name}` : 'behavioral health services', longDate(e.firstSession))} ${
      lines.length > 1 ? 'Additional services reasonably expected as part of the period of care are included. ' : ''
    }${recurring ? VALID_12_MONTHS : ''}`.trim(),
    9.5,
    { gap: 4 },
  );
  w.newPage();
  w.y -= 14;
  w.heading('Provider Estimate');
  w.fields([
    { label: 'Provider name', value: providerLine, w: 260 },
    { label: 'Provider type', value: 'Behavioral health provider', w: 200 },
  ]);
  w.fields([
    { label: 'Practice name', value: practice, w: 260 },
    { label: 'Address', value: address, w: 200 },
  ]);
  w.fields([
    { label: 'Contact phone', value: e.phone.trim(), w: 260 },
    { label: 'Email', value: e.email.trim(), w: 200 },
  ]);
  w.fields([
    { label: 'National Provider Identifier (NPI)', value: e.npi.replace(/\s/g, ''), w: 260 },
    { label: 'Taxpayer Identification Number (TIN)', value: e.tin.trim(), w: 200 },
  ]);

  /* --- Itemized table --------------------------------------------------------------------------- */
  w.y -= 4;
  w.need(110);
  const colSvc = M + 6;
  const colCode = M + 250;
  const colQty = M + 322;
  const colFee = M + 356;
  const colTot = W - M - 6;
  const header = () => {
    w.page.drawRectangle({ x: M, y: w.y - 22, width: W - 2 * M, height: 22, color: BAND });
    w.y -= 15;
    w.text('Service / item', colSvc, 8.5, { bold: true });
    w.text('Service code', colCode, 8.5, { bold: true });
    w.text('Quantity', colQty, 8.5, { bold: true });
    w.text('Cost each', 0, 8.5, { bold: true, right: colFee + 52 });
    w.text('Expected cost', 0, 8.5, { bold: true, right: colTot });
    w.y -= 7;
  };
  header();
  for (const l of lines) {
    const nameLines = w.wrap(l.name, regular, 9.5, 235);
    const rowH = Math.max(1, nameLines.length) * 13 + 14;
    if (w.y - rowH < M + 60) {
      w.newPage();
      w.y -= 4;
      header();
    }
    const top = w.y;
    nameLines.forEach((ln, i) => w.page.drawText(ln, { x: colSvc, y: top - 14 - i * 13, size: 9.5, font: regular, color: INK }));
    w.y = top - 14;
    w.text(`CPT ${l.code}`, colCode, 9.5);
    w.text(String(l.sessions), colQty, 9.5);
    w.text(formatMoney(l.feeCents), 0, 9.5, { right: colFee + 52 });
    w.text(formatMoney(l.totalCents), 0, 9.5, { right: colTot });
    w.y = top - rowH + 4;
    w.rule();
  }
  w.y -= 18;
  w.text('Total expected charges from this provider', M + 6, 10.5, { bold: true });
  w.text(formatMoney(totalCents), 0, 10.5, { bold: true, right: colTot });
  w.y -= 6;
  w.para(`Services will be provided at: ${address}.`, 9, { color: MUTED, gap: 2 });
  if (e.diagnosis.trim()) w.para(`Diagnosis code(s) used for this estimate: ${e.diagnosis.trim()}.`, 9, { color: MUTED, gap: 2 });
  w.para(`Total estimated cost for all services and items: ${formatMoney(totalCents)}`, 10, { bold: true, gap: 8 });

  /* --- Separately scheduled ----------------------------------------------------------------------- */
  w.heading(SEPARATE_PROVIDERS_HEADING, 9.5);
  w.para(SEPARATE_PROVIDERS_NOTE, 9.5);

  /* --- Disclaimer ------------------------------------------------------------------------------- */
  w.newPage();
  w.heading(DISCLAIMER_HEADING);
  for (const p of DISCLAIMER) w.para(p.text, 9.5, { bold: p.bold, gap: 7 });
  w.para(OFFICIAL_FORM_NOTE, 8, { color: MUTED, gap: 0 });

  /* --- Footer on every page ----------------------------------------------------------------------- */
  const total = w.pages.length;
  w.pages.forEach((pg, i) => {
    pg.drawLine({ start: { x: M, y: M - 6 }, end: { x: W - M, y: M - 6 }, thickness: 0.5, color: LINE });
    pg.drawText(FOOTER_LINE, { x: M, y: M - 20, size: 8.5, font: regular, color: MUTED });
    const label = `Page ${i + 1} of ${total}`;
    pg.drawText(label, { x: W - M - regular.widthOfTextAtSize(label, 8.5), y: M - 20, size: 8.5, font: regular, color: MUTED });
  });

  const bytes = await doc.save();
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  return { bytes, fileName: `good-faith-estimate-${slug(e.clientName.split(' ').pop() || 'client') || 'client'}-${e.issued}.pdf` };
}
