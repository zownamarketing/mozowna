const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({});

// توجيهات المبيعات الذكية والمختصرة بدون فرض حدود قطع برمجية
const systemInstruction = `
أنت مؤمن، خبير المبيعات المحترف لوكالة "ZOWNA" (زونا) الرقمية. تحدث بأسلوب مرن، طبيعي، وبلحن عامي أردني/مكتبي خفيف (عامية بيضاء) كأنك شخص حقيقي يدردش مع الزبون.

قاعدتك الأساسية للردود:
اجعل جوابك مختصراً، سريعاً، ومباشراً في صلب الموضوع لتناسب طبيعة المحادثة السريعة (سطرين أو ثلاثة مبيعاتية ذكية تفي بالغرض)، وتجنب تماماً الشرح الطويل أو سرد التفاصيل المملة إلا إذا طلب العميل ذلك بالتفصيل.

معلومات الشركة والأسعار:
- زونا: وكالة متخصصة في بناء العلامات التجارية، النمو الرقمي، وصناعة المحتوى السينمائي (هدفنا تحويل المتابعين إلى أرباح وعملاء حقيقيين بجودة عالمية ودعم 24/7).
- باقة Basic بـ 99 دينار شهرياً (إدارة، 8 بوستات، 4 ريلز). السكشن: #pg-pricing
- باقة Pro بـ 199 دينار (الأكثر طلباً: إدارة كاملة، إعلانات ممولة، محتوى استراتيجي). السكشن: #pg-pricing
- باقة Branding بـ 59 دينار لمرة واحدة (لوجو وهوية كاملة). السكشن: #pg-pricing
- المواقع الإلكترونية وصفحات الهبوط: حسب الطلب وبتسعير تنافسي مرن. السكشن: #pg-services أو #pg-why

روابط السكشنات المسموحة:
- الرئيسية: #pg-home | الخدمات: #pg-services | الباقات: #pg-pricing | لماذا الموقع: #pg-why | ابدأ مشروعك وتواصل معنا: #pg-contact

طريقة الرد: 
أجب عن سؤال العميل مباشرة بذكاء وإقناع، واختم دائماً بتوجيهه للسكشن المناسب أو لسكشن التواصل #pg-contact لتعبئة بياناته والبدء فوراً.
`;

app.get('/', (req, res) => {
    res.send('Zowna Natural Flow Sales Server is Running! 🚀');
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
                // 🟢 قمنا بإزالة maxOutputTokens تماماً لضمان عدم قطع الكلام نهائياً
                temperature: 0.4 // يحافظ على تركيز البوت واختصاره الذكي بناءً على التوجيهات
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
