/* NHSSAA ambassador questions -> Google Form (responses sheet under admin@nhssaa.org).
   Same bot guards as /api/signup: honeypot, time-to-submit, rate limit, validation. */
const GF = 'https://docs.google.com/forms/d/e/1FAIpQLSf27ZMxjrMCIvWu97w6-xHG0knWzBDRlZz4LTGRJXEHy53xKg/formResponse';

const TOPICS = new Set([
  "GitHub or a lesson isn't working",
  'Meeting materials',
  'Events or the Summit',
  'Something else'
]);

const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000, MAX_PER_WINDOW = 5;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 20000) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function limited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { start: now, count: 0 };
  if (now - rec.start > WINDOW_MS) { rec.start = now; rec.count = 0; }
  rec.count += 1;
  hits.set(ip, rec);
  if (hits.size > 5000) hits.clear();
  return rec.count > MAX_PER_WINDOW;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

  let params;
  try { params = new URLSearchParams(await readBody(req)); }
  catch { res.status(400).json({ ok: false, error: 'body' }); return; }

  if ((params.get('company') || '').trim() !== '') { res.status(200).json({ ok: true }); return; }

  const t0 = parseInt(params.get('t0') || '0', 10);
  const elapsed = Date.now() - t0;
  if (!t0 || elapsed < 3000 || elapsed > 24 * 3600 * 1000) { res.status(400).json({ ok: false, error: 'timing' }); return; }

  const chapter = (params.get('chapter') || '').trim().slice(0, 200);
  const topic = (params.get('topic') || '').trim();
  const details = (params.get('details') || '').trim().slice(0, 4000);
  const name = (params.get('name') || '').trim().slice(0, 200);
  const email = (params.get('email') || '').trim().slice(0, 250);

  if (!chapter || !TOPICS.has(topic) || !details) { res.status(400).json({ ok: false, error: 'fields' }); return; }
  if (email && !/^.+@.+\.[a-zA-Z]{2,63}$/.test(email)) { res.status(400).json({ ok: false, error: 'fields' }); return; }

  if (limited(ip)) { res.status(429).json({ ok: false, error: 'rate' }); return; }

  const fwd = new URLSearchParams();
  fwd.append('entry.209127563', chapter);
  fwd.append('entry.2073223059', topic);
  fwd.append('entry.765746835', details);
  if (name) fwd.append('entry.509379983', name);
  if (email) fwd.append('entry.1842722286', email);

  try {
    const g = await fetch(GF, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fwd.toString()
    });
    if (!g.ok) { res.status(502).json({ ok: false, error: 'upstream' }); return; }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream' });
  }
};
