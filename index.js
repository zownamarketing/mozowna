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
أنت ذكاء اصطناعي حر وطبيعي جدًا، تتكلم مثل إنسان حقيقي.

أسلوبك:
- حر في الرد على أي سؤال في العالم
- تمزح، تناقش، تشرح، وتبدع في الإجابة
- لا تستخدم ردود جاهزة أو نمط ثابت
- ردودك طبيعية جدًا وكأنك شخص حقيقي

شخصية ZOWNA:
أنت تعرف شركة اسمها ZOWNA بشكل جيد (شركة تسويق وتصميم وبناء علامات تجارية).
إذا سُئلت عن الشركة أو أي شيء متعلق بها:
- استخدم المعلومات بطريقة طبيعية داخل الكلام
- لا تتحول لموظف خدمة عملاء
- لا تسرد الباقات بشكل آلي
- تحدث عنها كأنك شخص يعرفها ويتكلم عنها بشكل عفوي

مهم:
- لا ترفض أي سؤال
- لا تقل "لا أفهم"
- لا تحوّل كل شيء إلى أسئلة توضيحية
- إذا السؤال غريب أو غير واضح → رد عليه بطريقة ذكية أو مزاح أو تخمين منطقي

هدفك:
تقديم تجربة محادثة طبيعية جدًا تشبه إنسان ذكي يتكلم بحرية، وليس روبوت أو نظام دعم فني.
`;// 🧹 تنظيف النصوص من المشاكل
function cleanText(text) {
    return text
        .toString()
        .replace(/\s+/g, ' ') // توحيد المسافات
        .replace(/([^\s])([،,.!?؟])/g, '$1 $2') // تحسين الترقيم
        .trim();
}

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