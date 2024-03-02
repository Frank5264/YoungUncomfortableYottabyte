import { db_menu } from '../lib/db_menu.js';
import fs from 'fs-extra';
import srk from 'wa-sticker-formatter'


export const maker_sticker = {

    async exec({ from, client, pushname, body, MessageType, messages, download_msg }) {

        if (messages.imageMessage && messages.imageMessage.mimetype === 'image/jpeg' || messages.documentMessage && messages.documentMessage.mimetype === 'image/png' ) {
            
            let fs_json = await fs.readJson(`./db/name_sticker/${from}.json`)
            .catch(err => {
                
                if (err) {
    
                    fs.writeJsonSync(`./db/name_sticker/${from}.json`, `${pushname}`)
                    console.log(`The ${from}.json file has been created`)
    
                }
            })
            let name_sticker = fs_json ? fs_json : pushname
            let imagePath = await client.downloadMediaMessage(download_msg);
            let sticker = new srk.Sticker(imagePath, { type: 'full', pack: name_sticker });
            await sticker.build();
            let bufferImage = await sticker.get();
            await client.sendMessage(from, bufferImage, MessageType.sticker)
            await client.sendMessage(from, 'استمتع بالملصق الخاص بك 🎁', MessageType.text)
            .catch((erro) => console.log(erro));
      
        }
      
          else if (body.startsWith('me') || body.startsWith('Me')){
      
            let name_sticker = body.slice(3)
            let mesg = `تم تغير الحقوق الى ${name_sticker} ✅`
            fs.writeJsonSync(`./db/name_sticker/${from}.json`, name_sticker)
            await client.sendMessage(from, mesg, MessageType.text).catch((erro) => console.log(erro));
            
      
        }

        else if (body === '*'){

            db_menu[from].menu_name = 7;

            let sticker_menu = '1- ملصق عشوائي 🔄 \n'
            sticker_menu += '2- ملصقات يوم الجمعة 🕌 \n'
            sticker_menu += '3- ملصقات صباح الخير ☀️ \n'
            sticker_menu += '4- ملصقات مساء الخير 🌑 \n'
            sticker_menu += '5- صانع الملصقات 🪧 \n\n\n'
            sticker_menu += '*【 للرجوع للقائمة الرئيسية أرسل #️ 】*'
     
            await client.sendMessage(from, sticker_menu, MessageType.text).catch((erro) => console.log(erro));
            
        }

        else if (body === 'hi' || body === 'Hi' || body === 'خدمة' || body === 'خدمه' || body === '#'){

            db_menu[from].menu_name = 0;

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

    }

}