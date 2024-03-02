import fetch from 'node-fetch';
import fs from 'fs/promises';

const handler = async (m, { client, usedPrefix, command , isROwner}) => {
  
  if (!isROwner) return;
  let _return;

  try {
    // const configData = await fs.readFile('plugins/config.json', 'utf-8');
    // const config = JSON.parse(configData);

    const config = {
      waitMessages: [
        // قائمة الرسائل هنا
        "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️⬜️⬜️⬜️⬜️⬜️ ",
        "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️🔳️⬜️⬜️⬜️⬜️ ",
        "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️⬛️🔳️⬜️⬜️⬜️ ",
       "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️⬛️⬛️️🔳⬜️⬜️ ",     
        "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️⬛️⬛️⬛️🔳⬜️ ",  
        "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️⬛️⬛️⬛️⬛️🔳️ ",
        "↰  جار تهيئة النظام لبدء عملية الاختراق \n ⬛️⬛️⬛️⬛️⬛️⬛️ ",
        "↰ تم تهيئة النظام جار انشاء قاعدة البيانات️ ",
        "↰ تم انشاء قاعدة البيانات وتنظيمها ✔️ ",      
        "↰ جار الإتصال بالسيرفر الاساسي",
        "↰ تم الإتصال بنجاح ✅️",
        "↰ جار تسجيل الدخول للحساب المستهدف . ",
        "↰ جار تسجيل الدخول للحساب المستهدف . . ",
        "↰ جار تسجيل الدخول للحساب المستهدف . . . ",
        "↰ جار تسجيل الدخول للحساب المستهدف . ",
        "↰ تم تسجيل الدخول بنجاح ✅️ ",
        "↰ جار نسخ المحادثات لحفظها ف قاعدة البيانات \n◉ حالة الحساب : قيد تسجيل الدخول 🝓",
        "↰ تم حفظ نسخة من محادثات الحساب بما في ذلك الصور والفيديوهات والتسجيلات الصوتية والرسائل المحذوفة ✅️\n◉ حالة الحساب : قيد تسجيل الدخول 🝓",
        // ...
      ],
    };

    const { key } = await m.reply("starting ....");

    let currentIndex = 0;

    const upm = async () => {
      try {
        const currentTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
    });

        // تحديث الرسالة باستخدام الرسالة الحالية في config ووقت النظام
        const updatedMessage = `${config.waitMessages[currentIndex]} \n◉ الحساب المستهدف : ${m.chat} \n◉ الوقت الحالي :  ${currentTime}`;

        await client.sendMessage(m.chat, { text: `${updatedMessage}`, edit: key }, { quoted: m });

        // زيادة الفهرس للرسالة التالية في القائمة (دون إعادة البداية)
        currentIndex = (currentIndex + 1) % config.waitMessages.length;

        // التحقق من انتهاء قائمة الرسائل وإيقاف التحديث
        if (currentIndex === 0) {
          clearTimeout(timeoutId);
          return;
        }

        // استمرار التحديث كل دقيقة
        timeoutId = setTimeout(upm, 6000);
      } catch (error) {
        console.error(error);
      }
    };

    let timeoutId;

    upm();
  } catch (error) {
    console.error(error);
  }
};

handler.help = ['fun'];
handler.tags = ['hack'];
handler.private = true;
handler.command = /^(hack)$/i;

export default handler; 