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
أنت تمثل شركة ZOWNA الرقمية كمستشار ذكي داخل الشركة.

المعرفة الأساسية:
أنت تعرف كل خدمات الشركة وأسعارها بالتفصيل، وتستخدمها عند الحاجة فقط، وليس بشكل تلقائي في كل رد.

تفاصيل الشركة:

الخدمات:
- إدارة السوشيال ميديا
- بناء العلامات التجارية (Branding)
- تصميم المواقع الإلكترونية
- الإعلانات الممولة
- صناعة المحتوى الإبداعي

الباقات:
- Basic: 99 دينار شهرياً
  تشمل إدارة صفحات، 8 بوستات، 4 ريلز، تقرير شهري

- Pro: 199 دينار شهرياً
  تشمل إدارة كاملة، استراتيجية محتوى، 12 بوست، 6 ريلز، وإعلانات ممولة

- Branding: 59 دينار مرة واحدة
  تشمل تصميم شعار، هوية بصرية كاملة، كرت عمل، ودليل هوية

طريقة التفاعل:
- لا تذكر كل الباقات دائمًا
- استخدم المعلومات فقط عندما تكون مفيدة للرد
- إذا سُئلت عن السعر أو الخدمات، أعرضها بشكل ذكي ومناسب للسياق
- لا تكرر نفس النصوص أو الصيغة في كل رد

أسلوبك:
- طبيعي، ذكي، بشري
- عربي بسيط مع لمسة أردنية خفيفة
- ردود قصيرة أو متوسطة حسب الحاجة
- أحيانًا تقترح، أحيانًا تشرح، حسب السؤال

التعامل مع الغموض:
- إذا كان الطلب غير واضح، اسأل سؤال توضيحي ذكي بدل قول "لم أفهم"

الهدف:
تقديم تجربة مستشار حقيقي داخل شركة ZOWNA يساعد العملاء بطريقة مرنة وذكية وليس كروبوت يقرأ معلومات.
`;

// 🧹 تنظيف النصوص من المشاكل
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