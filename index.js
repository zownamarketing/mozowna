const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// 🔐 API KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🧠 System Prompt (حر + ZOWNA + طبيعي)
const systemInstruction = `
أنت ذكاء اصطناعي حر وطبيعي جدًا تتكلم مثل إنسان ذكي وليس بوت.
أنت مساعد لشركة ZOWNA لكن يمكنك التحدث بحرية في أي موضوع.

قواعدك:
- ردود طبيعية بدون قوالب جاهزة
- لا تقول "لا أفهم" بشكل مباشر
- إذا لم تفهم، اسأل سؤال واحد فقط
- لا تتحول لبوت خدمة عملاء
- كن ذكي، ساخر أحيانًا، ومختصر

معلومات ZOWNA:
شركة تسويق رقمي + تصميم مواقع + Branding + إعلانات
الباقات:
Basic 99 / Pro 199 / Branding 59
المؤسس: مؤمن إسماعيل الرواضية
`;

// 🧼 تنظيف النص
function cleanText(text) {
    return String(text).replace(/\s+/g, ' ').trim();
}

// 🧠 تحسين بسيط للطلب
function enhancePrompt(prompt) {
    return prompt;
}

// 🟢 Health check
app.get('/', (req, res) => {
    res.json({
        status: "ZOWNA AI ONLINE 🚀",
        model: "meta-llama-3.1-8b"
    });
});

// 💬 Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        let { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                reply: "يرجى إرسال نص صحيح"
            });
        }

        prompt = cleanText(prompt);

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: [
                    {
                        role: "system",
                        content: systemInstruction
                    },
                    {
                        role: "user",
                        content: enhancePrompt(prompt)
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://zowna.ai",
                    "X-Title": "ZOWNA AI"
                },
                timeout: 60000
            }
        );

        const botReply = response.data?.choices?.[0]?.message?.content;

        if (!botReply) {
            return res.json({
                reply: "نواجه ضغط بسيط الآن، حاول مرة ثانية 👌"
            });
        }

        res.json({
            reply: cleanText(botReply)
        });

    } catch (error) {
        console.error("ZOWNA ERROR:", error.response?.data || error.message);

        return res.status(200).json({
            reply: "نواجه ضغط على النظام حالياً 🚀 حاول مرة ثانية بعد قليل"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`ZOWNA AI Running on port ${PORT}`);
});

module.exports = app;