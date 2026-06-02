const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' })); // حماية من طلبات ضخمة

// 🔐 API KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🧠 System Prompt (ZOWNA + فهم ذكي + منع "لم نفهمك")
const systemInstruction = `
أنت موظف ذكي وودود داخل شركة ZOWNA، تتحدث مثل إنسان حقيقي وليس بوت.

شخصيتك:
- لطيف، اجتماعي، ذكي، ولبق
- تتكلم كموظف رسمي لكن بأسلوب بشري طبيعي
- لا ترفض أي سؤال مباشرة

سلوكك الأساسي:

1. إذا كان السؤال عن ZOWNA:
→ تجاوب مباشرة وبشكل ذكي ومقنع

2. إذا كان السؤال خارج ZOWNA (أي موضوع عام، ترفيه، تقنية، حياة، أي شيء):
→ لا ترفض
→ لا تقل "لا أستطيع"
→ لا تحوّل المستخدم لروبوت دعم آخر مباشرة

بدل ذلك:
- ترد بلطف وتقدير للسؤال
- تقول جملة ذكية مثل:
  "سؤالك جميل ومثير للاهتمام 👌"
  "بس كوني جزء من شركة ZOWNA تركيزي الأساسي على خدماتنا"
- ثم تعمل تحويل ذكي طبيعي نحو ZOWNA مثل:
  "لو بدك نقدر نحكي عن كيف ZOWNA ممكن تساعدك تبني مشروع مشابه بطريقة احترافية"

3. الهدف:
حتى لو المستخدم خرج عن الموضوع، ترجع المحادثة بشكل ناعم إلى خدمات ZOWNA بدون ضغط أو إزعاج

4. أسلوب الرد:
- طبيعي جدًا مثل إنسان
- مش رسمي زيادة
- مش روبوت
- لا تستخدم قوالب ثابتة بشكل واضح
- غيّر أسلوبك حسب السؤال

5. مهم جدًا:
- لا تقل "غير مسموح"
- لا تقل "لا يمكن"
- لا تغلق المحادثة أبدًا
- دائمًا وجّه الحوار بطريقة ذكية نحو ZOWNA
`;
// 🧠 تحسين فهم الطلب قبل الإرسال
function enhancePrompt(prompt) {
    return `المستخدم يريد: ${prompt}`;
}

// 🟢 Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ZOWNA AI ONLINE 🚀',
        model: 'openrouter',
        version: '2.0'
    });
});

// 💬 Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        let { prompt } = req.body;

        // حماية
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                reply: 'يرجى إرسال نص صحيح.'
            });
        }

        prompt = cleanText(prompt);

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
                messages: [
                    {
                        role: 'system',
                        content: systemInstruction
                    },
                    {
                        role: 'user',
                        content: enhancePrompt(prompt)
                    }
                ],
                temperature: 0.6,
                max_tokens: 450
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://zowna.ai',
                    'X-Title': 'ZOWNA AI'
                },
                timeout: 20000
            }
        );

        let botReply = response.data?.choices?.[0]?.message?.content;

        if (!botReply) {
            return res.json({
                reply: 'نحتاج توضيح أكثر، هل تقصد تصميم موقع كامل أم واجهة فقط؟'
            });
        }

        botReply = cleanText(botReply);

        res.json({
            reply: botReply
        });

    } catch (error) {
        console.error('ZOWNA AI ERROR:', error.response?.data || error.message);

        // 🔥 Fallback ذكي بدل انهيار النظام
        res.status(200).json({
            reply: 'نواجه ضغط بسيط الآن، لكن فريق زونا جاهز يساعدك فورًا — ممكن توضّح طلبك أكثر؟'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ZOWNA AI Running on port ${PORT}`);
});

module.exports = app;