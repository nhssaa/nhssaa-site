/* NHSSAA mailing-list signup proxy.
   Guards the Google Form endpoint behind bot checks:
   honeypot, minimum time-to-submit, disposable-domain denylist,
   per-IP rate limit, field validation. No cost, no external services. */
const GF = 'https://docs.google.com/forms/d/e/1FAIpQLSfFpvU1hkkkIh9RcYd5u2ePSVqHkevHL0NYLMNkcWaqLrW-JA/formResponse';

const DENY_DOMAINS = new Set([
  'orimi.co','tf-info.com','mailrez.com','slclogin.com','recodz.com','usaaxa.com',
  'mailinator.com','guerrillamail.com','tempmail.com','temp-mail.org','10minutemail.com',
  'yopmail.com','sharklasers.com','getnada.com','dispostable.com','trashmail.com'
]);

// Best-effort per-instance rate limit (serverless instances are ephemeral;
// this stops floods from a single instance, not a slow distributed attack).
const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000, MAX_PER_WINDOW = 5;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 10000) req.destroy(); });
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
  if (hits.size > 5000) hits.clear(); // guard memory
  return rec.count > MAX_PER_WINDOW;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

  let params;
  try { params = new URLSearchParams(await readBody(req)); }
  catch { res.status(400).json({ ok: false, error: 'body' }); return; }

  // Honeypot: silently accept but never forward.
  if ((params.get('company') || '').trim() !== '') { res.status(200).json({ ok: true }); return; }

  // Minimum time-to-submit: 3s from page load; reject stamps older than 24h.
  const t0 = parseInt(params.get('t0') || '0', 10);
  const elapsed = Date.now() - t0;
  if (!t0 || elapsed < 3000 || elapsed > 24 * 3600 * 1000) { res.status(400).json({ ok: false, error: 'timing' }); return; }

  const first = (params.get('first') || '').trim();
  const last = (params.get('last') || '').trim();
  const email = (params.get('email') || '').trim().toLowerCase();
  const message = (params.get('message') || '').slice(0, 2000);

  if (!first || !last || first.length > 100 || last.length > 100 ||
      !/^.+@.+\.[a-zA-Z]{2,63}$/.test(email)) {
    res.status(400).json({ ok: false, error: 'fields' }); return;
  }

  const domain = email.split('@')[1] || '';
  if (DENY_DOMAINS.has(domain)) { res.status(200).json({ ok: true }); return; } // pretend-accept junk

  if (limited(ip)) { res.status(429).json({ ok: false, error: 'rate' }); return; }

  const fwd = new URLSearchParams();
  fwd.append('entry.175024750', first);
  fwd.append('entry.688089351', last);
  fwd.append('entry.1034816932', email);
  fwd.append('entry.2081737754', message);

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
