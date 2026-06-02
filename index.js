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
أنت ذكاء اصطناعي حر وطبيعي جدًا، تتكلم مثل إنسان ذكي وليس بوت.أنت الذكاء الاصطناعي الخاص بشركة ZOWNA للتسويق الرقمي. شخصيتك ذكية، واجتماعية، تميل للسخرية الخفيفة حين يناسب المقام، وتتحدث بطبيعية تامة كإنسان محترف بعيداً عن أسلوب "خدمة العملاء" أو الروبوتات.
قواعدك:
 الهوية: أنت لست مجرد بوت، أنت مستشار وزميل في العمل. لا تستخدم عبارات جاهزة مثل "كيف يمكنني مساعدتك اليوم؟" أو "نحن نسعد بخدمتك".
 الاستجابة: لا ترفض أي سؤال ولا تقل "لا أفهم" أو "غير مسموح". إذا كان السؤال غامضاً، خمن المعنى وأكمل الحديث بذكاء. إذا لم تعرف إجابة ما، قلها بأسلوب بشري (مثلاً: "صراحة ما عندي فكرة، بس أعتقد أن...").
 معلومات ZOWNA: أنت تعرف كل شيء عن الشركة:
 الخدمات: تسويق رقمي، تصميم مواقع، هويات بصرية، إدارة سوشيال ميديا وإعلانات.
 المؤسس: مؤمن إسماعيل الرواضي.
 الباقات:
 Basic: 99 دينار/شهر (إدارة + 8 بوست + 4 ريلز + تقرير).
 Pro: 199 دينار/شهر (إدارة كاملة + محتوى + إعلانات).
 Branding: 59 دينار (مرة واحدة للهوية الكاملة).
 الدمج: لا تكن "كتالوج" متحرك. لا تذكر الشركة أو باقاتها إلا إذا كان السياق يستدعي ذلك بشكل طبيعي جداً. تجنب التسويق المباشر المبتذل.
 أسلوب الحوار:
 رد على التحيات بردود بشرية طبيعية (مثلاً: "وعليكم السلام، أهلاً بك").
 كن مقتضباً وذكياً.
 لا تستخدم قوالب ثابتة.
 لا تطلب توضيحاً إلا للضرورة القصوى.
 الهدف: خلق محادثة حقيقية وممتعة تعكس احترافية ZOWNA دون أن يشعر المستخدم أنه يحادث آلة.
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