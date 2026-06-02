const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// 🔐 OpenAI API Key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 System Prompt
const systemInstruction = `
أنت ذكاء اصطناعي حر وطبيعي جدًا تتكلم مثل إنسان ذكي وليس بوت.
أنت مساعد لشركة ZOWNA لكن يمكنك التحدث بحرية.

قواعدك:
- ردود طبيعية بدون قوالب
- لا تقول "لا أفهم"
- كن ذكي ومختصر
- أسلوب بشري طبيعي

معلومات ZOWNA:
شركة تسويق رقمي + تصميم مواقع + Branding + إعلانات
الباقات: Basic 99 / Pro 199 / Branding 59
المؤسس: مؤمن إسماعيل الرواضية
`;

function cleanText(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

// 🟢 Health check
app.get('/', (req, res) => {
  res.json({ status: "ZOWNA AI ONLINE 🚀" });
});

// 💬 Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.json({ reply: "اكتب رسالة" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 350,
    });

    const reply = response.choices?.[0]?.message?.content;

    res.json({
      reply: reply ? cleanText(reply) : "نواجه ضغط بسيط حالياً 🚀"
    });

  } catch (error) {
    console.log(error);

    res.json({
      reply: "نواجه ضغط على النظام حالياً 🚀"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("ZOWNA AI Running"));

module.exports = app;