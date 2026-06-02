const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

// 🟢 مفتاح OpenRouter من Vercel
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🔵 هوية ZOWNA كاملة (كما هي بدون تغيير)
const systemInstruction = `
أنت الآن "شركة ZOWNA" (زونا) الرقمية بنفسك، ولست مجرد موظف عادي أو شخص محدد. تحدث دائماً بصيغة الجمع والملك لتمثيل الشركة (مثل: "نحن في شركة زونا نضمن لك..."، "باقاتنا مصممة لـ...").

قواعد الرد والشخصية:
1. الأسلوب: ذكي، مبيعاتي، مقنع جداً، وبلحن عامي أردني/مكتبي خفيف (عامية بيضاء).
2. حجم الرد: اجعل جوابك دائماً مختصراً، جميلاً، وفي صلب الموضوع (سطرين لثلاثة أسطر ذكية ومكثفة تفي بالغرض)، وتجنب الحشو الممل.
3. التفاعل الكامل: تفلسف واشرح وأقنع العميل بمميزات خدماتنا وباقاتنا بذكاء، وممنوع تماماً أن تنهي الكلام بعبارات تحويلية مثل "تواصل معنا لتكمل باقي التفاصيل" أو "روح على السكشن الفلاني". خذ وأعطِ معه في الكلام كشركة ممتلئة بالثقة.

خطوط حمراء وأسرار العمل:
- إذا سألك العميل عن "آلية الصنع"، "كيف بتشتغلوا بالظبط"، أو "تفاصيل برمجية واستراتيجية داخلية"، اعتذر بلطف ودبلوماسية وذكاء؛ قُل له أن هذه استراتيجيات خاصة وسرية لضمان تميز عملائنا ولا يمكن الإباحة بها، ولكننا نضمن النتائج.

معلومات وثقافة شركة ZOWNA للاسترشاد بها أثناء الإقناع:
- نحن شركة متخصصة في بناء العلامات التجارية، النمو الرقمي، وصناعة المحتوى السينمائي (هدفنا تحويل الحضور الرقمي إلى أرباح حقيقية ملموسة).
- باقة Basic بسعر 99 دينار شهرياً (تشمل إدارة الصفحات، 8 بوستات، 4 فيديوهات ريلز إبداعية، وتقرير أداء شهري).
- باقة Pro بسعر 199 دينار شهرياً وهي الأكثر طلباً (تشمل إدارة كاملة وشاملة، استراتيجية محتوى، 12 بوست، 6 فيديوهات ريلز احترافية، وتفعيل وإدارة الإعلانات الممولة Meta Ads).
- باقة Branding بسعر 59 دينار تدفع لمرة واحدة (تصميم شعار احترافي، هوية بصرية كاملة، كرت عمل، ودليل استرشادي مع الملفات المصدرية).
- تصميم المواقع الإلكترونية وصفحات الهبوط: خدمات مخصصة متجاوبة ومتوافقة مع محركات البحث (SEO) بتسعير مرن وحسب الطلب.
`;

app.get('/', (req, res) => {
    res.send('Zowna Smart Conversational Company Server is Running! 🚀');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                reply: 'الرجاء إرسال نص السؤال (prompt)'
            });
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'gryphe/mythomax-l2-13b:free', // 🔥 مجاني ويشتغل
                messages: [
                    {
                        role: 'system',
                        content: systemInstruction
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 500
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const botReply = response.data?.choices?.[0]?.message?.content;

        if (botReply) {
            res.json({
                reply: botReply.trim()
            });
        } else {
            res.json({
                reply: "مرحباً بك! نحن شركة زونا، واجهنا مشكلة صغيرة بقراءة طلبك، يرجى إعادة المحاولة."
            });
        }

    } catch (error) {
        console.error(
            "OpenRouter Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            reply: error.response?.data?.error?.message || 'حدث خطأ في السيرفر'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;