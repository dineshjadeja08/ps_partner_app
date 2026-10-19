/** "2026-10-16" → "Fri, 16 Oct 2026" */
export function formatDate(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return Number.isNaN(date.getTime()) ? isoDate : date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** ISO timestamp → "14 Oct, 03:38 PM" */
export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}`;
}

/** "08:00:00","10:00:00" → "8 – 10 AM"; "10:00:00","12:00:00" → "10 AM – 12 PM" */
export function formatSlot(start: string, end: string) {
  const part = (time: string) => { const [h, m] = time.split(':').map(Number); return { text: `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}`, period: h < 12 ? 'AM' : 'PM', valid: !Number.isNaN(h) }; };
  const a = part(start); const b = part(end);
  if (!a.valid || !b.valid) return `${start} – ${end}`;
  return a.period === b.period ? `${a.text} – ${b.text} ${b.period}` : `${a.text} ${a.period} – ${b.text} ${b.period}`;
}

/** Local calendar date as "YYYY-MM-DD", offset by whole days. */
export function localDay(offset = 0) {
  const date = new Date(); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
