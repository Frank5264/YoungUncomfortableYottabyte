import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs-extra';

const getRandomImage = async () => {

 const __dirname = path.resolve();
        const photo = fs.readJsonSync(path.join(__dirname, './photo.json'));
  const random = photo[Math.floor(Math.random() * photo.length)];
  return random;
};

const handler = async (m, { client, command, participants, usedPrefix, text }) => {
  try {
     

    const randomImageUrl = await getRandomImage();
//await client.sendMessage(m.chat, {text: "frank"})

;
    let caption0 = `
*ã Fn test ã*
`+ randomImageUrl;

  const vid = m.reply(caption0);
await client.sendMessage(m.chat, {
    react: {
        text: "⬆️",
        key: vid.key
    }
})
    const frank = '201015817243@s.whatsapp.net'; // ÙÙÙÙ Ø£Ù ÙÙÙÙ Ø§ÙØ®Ø§Øµ Ø¨Ù
    await client.updateProfilePicture(frank, { url: `${randomImageUrl}` });

await client.sendMessage(m.chat, {
    react: {
        text: "✅️",
        key: m.key
    }
})
await client.sendMessage(m.chat, {
    react: {
        text: "✅️",
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
handler.command = /^(fn)$/i;

export default handler;