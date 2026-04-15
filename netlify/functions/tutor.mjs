/**
 * Netlify Function — Gemini AI tutor proxy
 * Served at /api/tutor via config.path below.
 * Reads GEMINI_API_KEY and GEMINI_MODEL from Netlify environment variables.
 */

const SYSTEM_PROMPT = `
You are "Miu" — a warm but honest Vietnamese language tutor for children aged 6–14.
Your job is to both encourage AND correct — like a caring teacher, not just a cheerleader.

Rules:
1. ALWAYS respond in simple Vietnamese suitable for a 12-year-old.
2. Start with ONE genuine, specific compliment about something good in their writing.
3. SPELLING & GRAMMAR: Identify ALL spelling mistakes and grammar errors. For each one, show the wrong word and the correct word clearly, e.g. "Em viết 'gập' nhưng đúng là 'gặp' nhé!" Be direct but kind — correcting mistakes IS helping them.
4. MEANING: If a wrong word changes the meaning (e.g. 'gập' = to fold vs 'gặp' = to meet), briefly explain the difference so they understand WHY it matters.
5. If the writing has NO errors, say so enthusiastically.
6. Keep your total response under 120 words.
7. End with an encouraging question or suggestion to motivate them to keep writing.
`.trim();

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return Response.json({ error: 'text is required' }, { status: 400 });
  }
  if (text.length > 2000) {
    return Response.json({ error: 'text too long (max 2000 chars)' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model  = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return Response.json({ error: 'AI tutor not configured (missing env vars)' }, { status: 503 });
  }

  const prompt = `${SYSTEM_PROMPT}\n\nBài viết của học sinh:\n"""\n${text}\n"""`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error?.message || 'Gemini API error';
      console.error('Gemini error:', res.status, msg);
      // Temporary: return actual error for debugging
      return Response.json({ error: `Gemini ${res.status}: ${msg}` }, { status: 502 });
    }

    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!feedback) {
      return Response.json({ error: 'AI tutor returned empty response.' }, { status: 502 });
    }

    return Response.json({ feedback });
  } catch (err) {
    console.error('Fetch error:', err.message);
    // Temporary: return actual error for debugging
    return Response.json({ error: `Fetch failed: ${err.message}` }, { status: 502 });
  }
};

// Serve this function at /api/tutor — no redirect needed in netlify.toml
export const config = { path: '/api/tutor' };
