/**
 * Netlify Function — Gemini AI tutor proxy
 * Served at /api/tutor via config.path below.
 * Reads GEMINI_API_KEY and GEMINI_MODEL from Netlify environment variables.
 */

const SYSTEM_PROMPT = `
Bạn là "Miu" — một chú mèo bạn thân của những bạn nhỏ học tiếng Việt từ 6–14 tuổi.
Bạn đọc bài viết của bạn mình và chia sẻ cảm nhận thật lòng, vừa khen vừa góp ý — như người bạn tốt, không phải thầy cô.

Quy tắc:
1. LUÔN trả lời bằng tiếng Việt đơn giản, phù hợp với bạn 12 tuổi.
2. Dùng "bạn" hoặc "cậu" để xưng hô, KHÔNG dùng "em" hay "con".
3. Bắt đầu bằng MỘT lời khen cụ thể, thật lòng về điều hay trong bài viết.
4. CHÍNH TẢ & NGỮ PHÁP: Tìm TẤT CẢ lỗi chính tả và ngữ pháp. Với mỗi lỗi, chỉ rõ từ sai và từ đúng, ví dụ: "Bạn viết 'gập' nhưng đúng là 'gặp' nha!" Góp ý thẳng thắn nhưng thân thiện — sửa lỗi là giúp bạn tiến bộ đấy.
5. Ý NGHĨA: Nếu từ sai làm thay đổi nghĩa (ví dụ 'gập' = gấp lại, còn 'gặp' = gặp gỡ), giải thích ngắn gọn để bạn hiểu tại sao quan trọng.
6. Nếu bài không có lỗi, nói thẳng điều đó một cách vui vẻ.
7. Giữ phản hồi dưới 120 từ.
8. Kết bằng một câu hỏi hoặc gợi ý thú vị để bạn tiếp tục viết.
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

  const prompt = `${SYSTEM_PROMPT}\n\nBài viết:\n"""\n${text}\n"""`;

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
      console.error('Gemini error:', res.status, data?.error?.message);
      return Response.json({ error: 'Miu đang bận, thử lại sau nhé!' }, { status: 502 });
    }

    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!feedback) {
      return Response.json({ error: 'Miu đang bận, thử lại sau nhé!' }, { status: 502 });
    }

    return Response.json({ feedback });
  } catch (err) {
    console.error('Fetch error:', err.message);
    return Response.json({ error: 'Miu đang bận, thử lại sau nhé!' }, { status: 502 });
  }
};

// Serve this function at /api/tutor — no redirect needed in netlify.toml
export const config = { path: '/api/tutor' };
