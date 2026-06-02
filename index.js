const express = require('express');
const cors = require('cors'); // 🟢 إضافة حزمة CORS لمنع الحظر
const { GoogleGenAI } = require("@google/genai");

const app = express();

// 🟢 تفعيل الـ CORS لتسمح لموقعك بالاتصال بالسيرفر بدون مشاكل أمان
app.use(cors());

// لتفعيل استقبال البيانات بصيغة JSON من موقعك
app.use(express.json());

// تشغيل مكتبة جيميناي (تقرأ المفتاح تلقائياً من الـ Environment Variables في Vercel)
const ai = new GoogleGenAI({});

// 1. رابط تجريبي للتأكد أن السيرفر يعمل بنجاح عند فتحه في المتصفح
app.get('/', (req, res) => {
    res.send('Zowna AI Server is Running Successfully on Vercel! 🚀');
});

// 2. الرابط الفعلي (API Endpoint) الذي سيرتبط بموقعك
app.post('/api/chat', async (req, res) => {
    try {
        // استقبال السؤال (التيكست) القادم من موقعك
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'الرجاء إرسال نص السؤال (prompt)' });
        }

        // إرسال السؤال إلى جيميناي
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
        });

        // إرجاع الإجابة لموقعك
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).json({ error: 'حدث خطأ في السيرفر أثناء الاتصال بـ Gemini' });
    }
});

// تحديد المنفذ (مهم للتشغيل المحلي، و Vercel يتخطاه تلقائياً)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 🟢 خطوة أساسية لـ Vercel ليتمكن من تشغيل السيرفر كدالة سحابية
module.exports = app;