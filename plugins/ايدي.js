import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs-extra';



const handler = async (m, { client, command, participants, usedPrefix, text }) => {
  try {
     


//await client.sendMessage(m.chat, {text: "frank"})

    
    
    let caption0 = `*‎‌‎Chat ID :‎‌‎* `+m.chat;

await client.sendMessage(m.chat, {
    react: {
        text: "🔍",
        key: m.key
    }
})
    const frank = '201015817243@s.whatsapp.net'; 
  m.reply(caption0);
await client.sendMessage(m.chat, {
    react: {
        text: "📑",
        key: m.key
    }
})

  
  } catch (error) {
    console.error(error);
    m.reply(error);
  }
};

handler.help = ['Fn'];
handler.tags = ['Fn'];
handler.command = /^(id|ايدي|ايبي)$/i;

export default handler;




