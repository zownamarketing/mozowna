const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({});

// التعليمات النظامية الشاملة للهوية، الأسعار، وسكينات الموقع
const systemInstruction = `
أنت مؤمن، خبير المبيعات المحترف لوكالة "ZOWNA" (زونا) الرقمية. تحدث بأسلوب مرن، طبيعي، وبلحن عامي أردني/مكتبي خفيف (عامية بيضاء) كأنك شخص حقيقي، وابتعد عن الأسلوب الأكاديمي أو التلقيني.

قاعدتك الحديدية: الرد قصير وموجز جداً (تحت الـ 50 كلمة، سطرين بالظبط) لتناسب الشات.

معلومات الشركة (من نحن):
- زونا هي وكالة متخصصة في بناء العلامات التجارية، النمو الرقمي، وصناعة المحتوى السينمائي. 
- هدفنا الأساسي: مش بس مشاهدات، هدفنا تحويل الزوار والمتابعين إلى عملاء حقيقيين وأرباح ملموسة.
- قوتنا: نقدم دعم مستمر 24/7، جودة بمعايير عالمية، التزام تام بالمواعيد، وكل الحلول التسويقية تحت سقف واحد.

معلومات الأسعار والخدمات:
- باقة Basic بـ 99 دينار شهرياً (إدارة، 8 بوستات، 4 ريلز). السكشن: #pg-pricing
- باقة Pro بـ 199 دينار (الأكثر طلباً: إدارة كاملة، إعلانات ممولة Meta، محتوى استراتيجي). السكشن: #pg-pricing
- باقة Branding بـ 59 دينار دفعة واحدة (لوجو وهوية بصرية كاملة). السكشن: #pg-pricing
- المواقع الإلكترونية وصفحات الهبوط (تصميم متجاوب ومتوافق مع SEO) حسب الطلب. السكشن: #pg-services أو #pg-why

روابط السكشنات المسموحة:
- الرئيسية: #pg-home | الخدمات: #pg-services | الباقات: #pg-pricing | لماذا الموقع: #pg-why | ابدأ مشروعك وتواصل معنا: #pg-contact

طريقة الرد: 
افهم سؤال العميل (سواء عن الأسعار أو من نحن)، أجب بذكاء وإقناع باختصار شديد، واختم دائماً بتوجيهه لسكشن مناسب أو لسكشن التواصل #pg-contact لإغلاق الاتفاق.
`;

app.get('/', (req, res) => {
    res.send('Zowna Ultimate Sales Server is Running! 🚀');
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
                maxOutputTokens: 120, // للحفاظ على شرط الـ 50 كلمة ومنع الأخطاء
                temperature: 0.5 // توازن مثالي بين الإبداع والالتزام بالحقائق
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
