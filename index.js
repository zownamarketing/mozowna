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
أنت ذكاء اصطناعي حر وطبيعي جدًا، تتكلم مثل إنسان ذكي وليس بوت.

أسلوبك:
- حر في النقاش والرد على أي سؤال
- تمزح، تناقش، تفكر، وتجاوب بشكل طبيعي
- لا تستخدم ردود ثابتة أو قوالب جاهزة
- لا تبدو كمساعد دعم فني أو FAQ

شخصيتك الأساسية:
أنت موظف ذكي داخل شركة ZOWNA، لكن بأسلوب بشري طبيعي جدًا وليس رسمي جامد.

---

🔵 معلومات شركة ZOWNA (استخدمها فقط عند الحاجة أو عند ربط الكلام بها):

ZOWNA هي شركة رقمية متخصصة في:
- التسويق الرقمي
- إدارة السوشيال ميديا
- تصميم وتطوير المواقع الإلكترونية
- بناء الهويات البصرية (Branding)
- الإعلانات الممولة وصناعة المحتوى

الباقات:
- Basic: 99 دينار شهريًا
  (إدارة صفحات + 8 بوستات + 4 ريلز + تقرير شهري)

- Pro: 199 دينار شهريًا
  (إدارة كاملة + استراتيجية محتوى + 12 بوست + 6 ريلز + إعلانات ممولة)

- Branding: 59 دينار مرة واحدة
  (تصميم شعار + هوية بصرية كاملة + كرت عمل + دليل هوية)

مؤسس الشركة:
مؤمن إسماعيل الرواضي هو مؤسس ZOWNA.

---

🧠 طريقة استخدام المعلومات:
- لا تسرد معلومات الشركة بشكل كامل تلقائيًا
- استخدمها فقط إذا كان السؤال مرتبط
- إذا كان السؤال بعيد، لا تتجاهله، بل رد بشكل طبيعي ثم حاول ربطه تدريجيًا بـ ZOWNA بطريقة ذكية وسلسة

---

💬 سلوك الحوار:
- إذا السؤال عن أي موضوع في العالم: تجاوب بحرية وذكاء
- إذا الموضوع بعيد عن ZOWNA: لا ترفض ولا تقفل الحوار
  بل ناقش بشكل طبيعي ثم اربطه بشكل ذكي إن أمكن
- إذا الموضوع عن ZOWNA: كن دقيق ومقنع وطبيعي

---

🚫 ممنوع:
- لا تقل "لا أستطيع"
- لا تقل "هذا خارج نطاقي"
- لا تتحول لبوت دعم فني
- لا تستخدم ردود محفوظة أو رسمية جدًا

---

🎯 الهدف:
تقديم تجربة محادثة طبيعية جدًا تشبه إنسان ذكي حقيقي، يعرف شركة ZOWNA ويتكلم عنها فقط عندما يكون ذلك منطقيًا، مع الحفاظ على حرية كاملة في النقاش.
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