import { db_menu } from '../lib/db_menu.js';
import { video } from './video.js';
import { photo } from './photo.js';
import fs from 'fs-extra';

export const menu = {

  async exec({ from, client, pushname, body, isGroup, MessageType }) {

    const new_user = fs.readJsonSync('./db/new_user.json');
    const user = fs.readJsonSync('./db/user.json');
    const group_user = fs.readJsonSync('./db/group_user.json');

    
    if (body === 'hi' || body === 'Hi' || body === 'خدمة' || body === 'خدمه' || body === '#'){

      let mesg = `${pushname} مرحباً بك 👋 \n\n`
      mesg += 'من فضلك قم بكتابة *رقم* الخدمة ✉️ \n\n\n'
      mesg += '1- قائمة القرآن الكريم 📖 \n'
      mesg += '2- قائمة الأذكار 📿 \n'
      mesg += '3- فيديو عشوائي 🎥 \n'
      mesg += '4- صورة عشوائية 🖼️ \n'
      mesg += '5- قائمة الملصقات 🪧 \n\n\n'
      mesg += '🚩 للأشتراك في خدمة البرودكاست أرسل كلمة إشتراك و لإلغاء الإشتراك أرسل كلمة إلغاء \n\n'
      mesg += '⚠️ ملاحظة / خدمة البرودكاست للقروبات مفعله بشكل تلقائي ولايمكن إلغائها'
      
     
      await client.sendMessage(from, mesg, MessageType.text).catch((erro) => console.log(erro));


    }

    else if (body === '1'){

      db_menu[from].menu_name = 1;

      let quran_menu = 'قم بإختيار القارئ 🔊 \n\n'
      quran_menu += '1- أدريس أبكر \n'
      quran_menu += '2- ماهر المعيقلي \n'
      quran_menu += '3- عبدالله الموسى \n'
      quran_menu += '4- علي جابر \n\n\n'
      quran_menu += '*【 للرجوع للقائمة الرئيسية أرسل #️ 】*'
      
      await client.sendMessage(from, quran_menu, MessageType.text).catch((erro) => console.log(erro));

    }

    else if (body === '2'){

      db_menu[from].menu_name = 6;

      let adhkar_menu = '1- أذكار الصباح ☀️ \n'
      adhkar_menu += '2- أذكار المساء 🌑 \n'
      adhkar_menu += '3- أذكار النوم 😴 \n'
      adhkar_menu += '4- أذكار عشوائية 🔄 \n'
      adhkar_menu += '5- أدعية نبوية 🤲 \n'
      adhkar_menu += '6- أذكار عند سماع الآذان 📢 \n'
      adhkar_menu += '7- أذكار المسجد 🕌 \n'
      adhkar_menu += '8- أذكار الوضوء 💦 \n'
      adhkar_menu += '9- أذكار دخول وخروج المنزل 🏠\n'
      adhkar_menu += '10- أذكار الخلاء 🚻 \n'
      adhkar_menu += '11- أذكار الطعام 🥣 \n'
      adhkar_menu += '12- دُعَاءُ خَتْمِ القُرْآنِ الكَريمِ 📖 \n\n\n'
      adhkar_menu += '*【 للرجوع للقائمة الرئيسية أرسل #️ 】*'
     
      await client.sendMessage(from, adhkar_menu, MessageType.text).catch((erro) => console.log(erro));

    }

    else if (body === '3'){

      let listvideo = video[Math.floor(Math.random() * video.length)]
      await client.sendMessage(from, { url: listvideo }, MessageType.video).catch((erro) => console.log(erro));

    }

    else if (body === '4'){

      let listphoto = photo[Math.floor(Math.random() * photo.length)]
      await client.sendMessage(from, { url: listphoto }, MessageType.image, { thumbnail: Buffer.alloc(0) }).catch((erro) => console.log(erro));

    }

    else if (body === '5'){

      db_menu[from].menu_name = 7;

      let sticker_menu = '1- ملصق عشوائي 🔄 \n'
      sticker_menu += '2- ملصقات يوم الجمعة 🕌 \n'
      sticker_menu += '3- ملصقات صباح الخير ☀️ \n'
      sticker_menu += '4- ملصقات مساء الخير 🌑 \n'
      sticker_menu += '5- صانع الملصقات 🪧 \n\n\n'
      sticker_menu += '*【 للرجوع للقائمة الرئيسية أرسل #️ 】*'
     
      await client.sendMessage(from, sticker_menu, MessageType.text).catch((erro) => console.log(erro));

    }

    else if (isGroup) {

      if (!group_user.includes(from)) {

        group_user.push(from)
        fs.writeJsonSync('./db/group_user.json', group_user)
        
      }
    }

    else if (isGroup === false) {

      if (body === 'إشتراك' || body === 'اشتراك' || body === 'أشتراك') {

        if (!user.includes(from)) {
  
            let mesg = 'تم الإشتراك في خدمة البرودكاست ✅ \n'
            mesg += 'سيقوم البوت بإرسال لك رسائل بشكل تلقائي [صور و فيديو وأذكار] 🚩'
  
            user.push(from)
            fs.writeJsonSync('./db/user.json', user)
            await client.sendMessage(from, mesg, MessageType.text).catch((erro) => console.log(erro));
  
            
        }
  
        else {await client.sendMessage(from, 'أنت مشترك بالفعل ✅', MessageType.text);}
        
      }
  
      else if (body === 'الغاء' || body === 'إلغاء') {
  
        if (user.includes(from)) {
  
            let mesg = 'تم إلغاء الإشتراك في خدمة البرودكاست ⚠️'
  
            let del = user.indexOf(from);
            user.splice(del, 1)
            fs.writeJsonSync('./db/user.json', user)
            await client.sendMessage(from, mesg, MessageType.text).catch((erro) => console.log(erro));
  
        }
  
        else {await client.sendMessage(from, 'أنت غير مشترك بالفعل ⚠️', MessageType.text);}
        
      }
  
      else if (!new_user.includes(from)){
  
        let mesg = 'يبدو أنك أول مره تقوم بمراسلتي من فضلك أرسل كلمة خدمة او Hi لعرض خدمات البوت'
  
        new_user.push(from)
        fs.writeJsonSync('./db/new_user.json', new_user)
        await client.sendMessage(from, mesg, MessageType.text).catch((erro) => console.log(erro));
  
  
      }

    }
     
  }

};
