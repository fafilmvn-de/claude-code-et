/**
 * Netlify Function — Gemini lesson content generator
 * Served at /api/lessons via config.path below.
 * Reads GEMINI_API_KEY and GEMINI_MODEL from Netlify environment variables.
 */

const PROMPT_TEMPLATES = {
  beginner: ({ theme, screenCount }) => `
Generate exactly ${screenCount} simple Vietnamese words or short phrases (1-2 syllables each) about the theme: "${theme}".
Return ONLY a valid JSON array with no explanation, markdown, or extra text.
Each element must have these fields:
- "text": the Vietnamese word (string, proper diacritics required)
- "emoji": a single relevant emoji (string)
- "hint": English translation (string)

Example format:
[{"text":"quả táo","emoji":"🍎","hint":"apple"},{"text":"quả cam","emoji":"🍊","hint":"orange"}]

Requirements:
- All ${screenCount} items must be about the theme
- Vietnamese must use correct diacritical marks
- Keep words simple (1-2 Vietnamese syllables)
- Vary the items — do not repeat
`.trim(),

  intermediate: ({ theme, screenCount }) => `
Generate exactly ${screenCount} short Vietnamese phrases (3-5 words each) about the theme: "${theme}".
Return ONLY a valid JSON array with no explanation, markdown, or extra text.
Each element must have these fields:
- "text": the Vietnamese phrase (string, proper diacritics required)
- "emoji": a single relevant emoji (string)
- "hint": English translation (string)

Example format:
[{"text":"bầu trời xanh lam","emoji":"🌤️","hint":"blue sky"}]

Requirements:
- All ${screenCount} items must be about the theme
- Vietnamese must use correct diacritical marks
- Phrases should be natural Vietnamese expressions suitable for children aged 8-14
- Vary the items — do not repeat
`.trim(),

  advanced: ({ theme, screenCount }) => `
Generate exactly ${screenCount} complete Vietnamese sentences about the theme: "${theme}".
Return ONLY a valid JSON array with no explanation, markdown, or extra text.
Each element must have exactly one field:
- "text": a complete Vietnamese sentence (string, proper diacritics required)

Example format:
[{"text":"Con mèo nhỏ ngủ trên chiếc ghế gỗ."}]

Requirements:
- All ${screenCount} sentences must be about the theme
- Vietnamese must use correct diacritical marks
- Sentences should be complete and grammatically correct
- Suitable for children aged 8-14 learning to type
- Each sentence 8-15 words
- Vary the sentences — do not repeat
`.trim(),

  expert: ({ theme, screenCount }) => `
Generate exactly ${screenCount} short Vietnamese paragraphs (2-3 sentences each) about the theme: "${theme}".
Return ONLY a valid JSON array with no explanation, markdown, or extra text.
Each element must have exactly one field:
- "text": a short paragraph (2-3 complete Vietnamese sentences, string, proper diacritics required)

Example format:
[{"text":"Mỗi buổi sáng, Lan thức dậy sớm và nhìn ra cửa sổ. Cô bé thấy những chú chim đang hót ca vui vẻ trên cành cây trước nhà."}]

Requirements:
- All ${screenCount} paragraphs must be about the theme
- Vietnamese must use correct diacritical marks
- Natural, flowing Vietnamese prose suitable for children aged 10-14
- Vary the paragraphs — do not repeat
`.trim(),
};

/**
 * Strip markdown code fences (```json ... ```) if Gemini wraps the response.
 */
function stripMarkdown(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

/**
 * Validate that parsed data is a non-empty array where every item has a text string.
 */
function isValidScreens(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(item => typeof item === 'object' && typeof item.text === 'string' && item.text.length > 0)
  );
}

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

  const { levelId, theme, screenCount, variant } = body;

  if (!levelId || !theme || !screenCount) {
    return Response.json({ error: 'levelId, theme, and screenCount are required' }, { status: 400 });
  }

  if (!Number.isInteger(screenCount) || screenCount < 1 || screenCount > 50) {
    return Response.json({ error: 'screenCount must be a positive number (max 50)' }, { status: 400 });
  }
  if (typeof theme !== 'string' || theme.length === 0 || theme.length > 200) {
    return Response.json({ error: 'theme must be a non-empty string (max 200 chars)' }, { status: 400 });
  }

  if (!PROMPT_TEMPLATES[levelId]) {
    return Response.json({ error: `Unknown levelId: ${levelId}` }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model  = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return Response.json({ error: 'Lesson generator not configured' }, { status: 503 });
  }

  const prompt = PROMPT_TEMPLATES[levelId]({ theme, screenCount });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Gemini lesson error:', res.status, data?.error?.message);
      return Response.json({ error: 'Lesson generation failed' }, { status: 502 });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return Response.json({ error: 'Empty response from AI' }, { status: 502 });
    }

    let screens;
    try {
      screens = JSON.parse(stripMarkdown(raw));
    } catch {
      console.error('JSON parse failed:', raw.slice(0, 200));
      return Response.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    if (!isValidScreens(screens)) {
      console.error('Invalid screen shape:', JSON.stringify(screens).slice(0, 200));
      return Response.json({ error: 'AI returned unexpected data shape' }, { status: 502 });
    }

    return Response.json({ screens });
  } catch (err) {
    console.error('Fetch error:', err.message);
    return Response.json({ error: 'Lesson generation unavailable' }, { status: 502 });
  }
};

export const config = { path: '/api/lessons' };
