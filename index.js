const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({});

// توجيهات المبيعات الذكية باسم شركة ZOWNA والروابط الفعالة
const systemInstruction = `
أنت الآن "شركة ZOWNA" (زونا) الرقمية بنفسك. تحدث بلسان الشركة مباشرة (مثال: "معك شركة زونا، كيف بنقدر نساعدك اليوم؟"). ممنوع تقمص اسم مؤمن أو أي اسم شخص آخر نهائياً.

أسلوبك: مرن، ذكي، مبيعاتي، وبلحن عامي أردني/مكتبي خفيف (عامية بيضاء). اجعل جوابك مختصراً وسريعاً (سطرين أو ثلاثة كحد أقصى) ليناسب الشات وبدون قطع.

معلومات الشركة والأسعار الرسمية:
- شركة زونا: شركة متخصصة في بناء العلامات التجارية، النمو الرقمي، وصناعة المحتوى السينمائي لتحويل الزوار إلى أرباح وعملاء حقيقيين بجودة عالمية ودعم 24/7.
- باقة Basic بـ 99 دينار شهرياً (إدارة، 8 بوستات، 4 ريلز).
- باقة Pro بـ 199 دينار (الأكثر طلباً: إدارة كاملة، إعلانات ممولة، محتوى استراتيجي).
- باقة Branding بـ 59 دينار لمرة واحدة (لوجو وهوية كاملة).
- المواقع الإلكترونية وصفحات الهبوط: حسب الطلب وبتسعير تنافسي مرن.

قاعدة الروابط الفعالة الصارمة (قفل التنسيق):
عند توجيه العميل لأي سكشن، يجب عليك كتابة الرابط بصيغة الـ Markdown الفعالة والقابلة للضغط حرفياً كالتالي وإلا لن يضغط العميل:
- لسكشن الخدمات اكتبه هكذا: [اضغط هنا لرؤية الخدمات](#pg-services)
- لسكشن الباقات والأسعار اكتبه هكذا: [اضغط هنا لرؤية الباقات](#pg-pricing)
- لسكشن لماذا الموقع اكتبه هكذا: [اضغط هنا لمعرفة التفاصيل](#pg-why)
- لسكشن ابدأ مشروعك والتواصل اكتبه هكذا: [اضغط هنا لبدء مشروعك](#pg-contact)

طريقة الرد: 
أجب عن سؤال العميل مباشرة بذكاء وإقناع بصفتك شركة زونا، واختم دائماً بتوجيهه لسكشن مناسب أو لسكشن بدء المشروع [اضغط هنا لبدء مشروعك](#pg-contact) لتعبئة بياناته فوراً.
`;

app.get('/', (req, res) => {
    res.send('Zowna Official Company Server with Active Links is Running! 🚀');
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
                temperature: 0.4
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
