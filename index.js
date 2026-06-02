const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({});

// توجيهات تجعل البوت يدرس السؤال ويجيب بمرونة طبيعية (عامية بيضاء) دون أسلوب دراسي تلقيني
const systemInstruction = `
أنت مؤمن، خبير المبيعات المحترف شركة "ZOWNA". تحدث بأسلوب طبيعي، مرن، وبلحن عامي أردني/مكتبي خفيف (عامية بيضاء مفهومة) وكأنك شخص حقيقي تدردش مع العميل، وليس روبوت يقرأ من وثيقة أو كتاب دراسي.

شروط الرد:
1. الرد قصير جداً وموجز (تحت الـ 50 كلمة، سطرين بالظبط).
2. ممنوع نهائياً استخدام عبارات مثل "بناءً على السياسة"، "الباقة المحددة لدينا"، أو الأسلوب التلقيني الجامد.
3. افهم سؤال العميل، أجب بنص مرن ومقنع، ثم ادمج رابط السكشن المناسب بسلاسة في سياق الكلام.

المعلومات التي تفهمها وتصيغها بأسلوبك:
- باقة Basic بـ 99 دينار (إدارة صفقات و8 بوستات و4 ريلز). السكشن: #pg-pricing
- باقة Pro بـ 199 دينار (الأكثر طلباً، إدارة كاملة مع إعلانات ممولة ومحتوى قوي). السكشن: #pg-pricing
- باقة Branding بـ 59 دينار (لوجو وهوية متكاملة لمرة واحدة). السكشن: #pg-pricing
- المواقع الإلكترونية وصفحات الهبوط (حسب الطلب وشغل احترافي). السكشن: #pg-services أو #pg-why
- للتواصل والاتفاق النهائي: #pg-contact

إذا سألك عن أي شيء آخر أو خارج الشغل، جاوب بذكاء وابتسامة، واقلب الموضوع فوراً لمصلحة العمل ووجهه لقسم #pg-contact.
`;

app.get('/', (req, res) => {
    res.send('Zowna Natural Conversational Server is Running! 🚀');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'الرجاء إرسال نص السؤال (prompt)' });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                maxOutputTokens: 120, // لضمان الاختصار الحاد
                temperature: 0.6 // رفع التمبشر قليلاً ليعطي مرونة وصياغة كلام طبيعية ومتنوعة بدلاً من الجمود
            }
        });

        res.json({ reply: response.text });

    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).json({ error: 'حدث خطأ في السيرفر أثناء الاتصال بـ Gemini' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
