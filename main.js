process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './api.js';
import {createRequire} from 'module';
import path, {join} from 'path';
import {fileURLToPath, pathToFileURL} from 'url';
import {platform} from 'process';
import * as ws from 'ws';
import {readdirSync, statSync, unlinkSync, existsSync, readFileSync, rmSync, watch} from 'fs';
import yargs from 'yargs';
import {spawn} from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import {tmpdir} from 'os';
import {format} from 'util';
import P from 'pino';
import pino from 'pino';
import Pino from 'pino';
import {Boom} from '@hapi/boom';
import {makeWASocket, protoType, serialize} from './lib/simple.js';
import {Low, JSONFile} from 'lowdb';
import {mongoDB, mongoDBV2} from './lib/mongoDB.js';
import store from './lib/store.js';
const {proto} = (await import('@whiskeysockets/baileys')).default;
const {DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC} = await import('@whiskeysockets/baileys');
import readline from 'readline';
import NodeCache from 'node-cache';
const {CONNECTING} = ws;
const {chain} = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '');

global.timestamp = {start: new Date};
global.videoList = [];
global.videoListXXX = [];

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-.@').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();



global.chatgpt = new Low(new JSONFile(path.join(__dirname, '/db/chatgpt.json')));
global.loadChatgptDB = async function loadChatgptDB() {
  if (global.chatgpt.READ) {
    return new Promise((resolve) =>
      setInterval(async function() {
        if (!global.chatgpt.READ) {
          clearInterval(this);
          resolve( global.chatgpt.data === null ? global.loadChatgptDB() : global.chatgpt.data );
        }
      }, 1 * 1000));
  }
  if (global.chatgpt.data !== null) return;
  global.chatgpt.READ = true;
  await global.chatgpt.read().catch(console.error);
  global.chatgpt.READ = null;
  global.chatgpt.data = {
    users: {},
    ...(global.chatgpt.data || {}),
  };
  global.chatgpt.chain = lodash.chain(global.chatgpt.data);
};
loadChatgptDB();

/* ------------------------------------------------*/

global.authFile = `MysticSession`;
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion();
let phoneNumber = global.botnumber

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

const connectionOptions = {
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, 
        mobile: useMobile, 
        browser: ['El-qary', '', ''],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true, 
        generateHighQualityLinkPreview: true, 
        getMessage: async (clave) => {
            let jid = jidNormalizedUser(clave.remoteJid)
            let msg = await store.loadMessage(jid, clave.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        msgRetryCounterMap,
        defaultQueryTimeoutMs: undefined,   
        version
};

global.client = makeWASocket(connectionOptions);

    if (pairingCode && !client.authState.creds.registered) {
        if (useMobile) throw new Error('لا يمكن استخدام رمز الاقتران مع Mobile API')

        let numeroTelefono
        if (!!phoneNumber) {
            numeroTelefono = phoneNumber.replace(/[^0-9]/g, '')

            if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
                console.log(chalk.bgBlack(chalk.redBright("ابدأ برمز البلد الخاص برقم واتساب الخاص بك.\nمثال: +5219992095479")))
                process.exit(0)
            }
        } else {
            numeroTelefono = await question(chalk.bgBlack(chalk.greenBright(`الرجاء كتابة رقم الواتساب الخاص بك.\nمثال: +5219992095479:`)))
            numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '')
            if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
                console.log(chalk.bgBlack(chalk.redBright("ابدأ برمز البلد الخاص برقم واتساب الخاص بك.\nمثال: +5219992095479")))

                numeroTelefono = await question(chalk.bgBlack(chalk.greenBright(`الرجاء كتابة رقم الواتساب الخاص بك.\nمثال: +5219992095479:`)))
                numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '')
                rl.close()
            }
        }

        setTimeout(async () => {
            let codigo = awaitclient.requestPairingCode(numeroTelefono)
            codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo
            console.log(chalk.black(chalk.bgGreen(`Su código de emparejamiento: `)), chalk.black(chalk.white(codigo)))
        }, 3000)
    }

client.isInit = false;
client.well = false;
client.logger.info(`[ ℹ️ ] جارٍ التحميل...\n`);

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', 'jadibts'], tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])));
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.client, PORT);




function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file); // 3 minutes
    return false;
  });
}

function purgeSession() {
let prekey = []
let directorio = readdirSync("./MysticSession")
let filesFolderPreKeys = directorio.filter(file => {
return file.startsWith('pre-key-') /*|| file.startsWith('session-') || file.startsWith('sender-') || file.startsWith('app-') */
})
prekey = [...prekey, ...filesFolderPreKeys]
filesFolderPreKeys.forEach(files => {
unlinkSync(`./MysticSession/${files}`)
})
} 

function purgeSessionSB() {
try {
let listaDirectorios = readdirSync('./jadibts/');
let SBprekey = []
listaDirectorios.forEach(directorio => {
if (statSync(`./jadibts/${directorio}`).isDirectory()) {
let DSBPreKeys = readdirSync(`./jadibts/${directorio}`).filter(fileInDir => {
return fileInDir.startsWith('pre-key-') /*|| fileInDir.startsWith('app-') || fileInDir.startsWith('session-')*/
})
SBprekey = [...SBprekey, ...DSBPreKeys]
DSBPreKeys.forEach(fileInDir => {
unlinkSync(`./jadibts/${directorio}/${fileInDir}`)
})
}
})
if (SBprekey.length === 0) return; //console.log(chalk.cyanBright(`=> No hay archivos por eliminar.`))
} catch (err) {
console.log(chalk.bold.red(`[ℹ️] حدث خطأ ما أثناء الحذف، ولم يتم حذف الملفات`))
}}

function purgeOldFiles() {
const directories = ['./MysticSession/', './jadibts/']
const oneHourAgo = Date.now() - (60 * 60 * 1000)
directories.forEach(dir => {
readdirSync(dir, (err, files) => {
if (err) throw err
files.forEach(file => {
const filePath = path.join(dir, file)
stat(filePath, (err, stats) => {
if (err) throw err;
if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') { 
unlinkSync(filePath, err => {  
if (err) throw err
console.log(chalk.bold.green(`Archivo ${file} borrado con éxito`))
})
} else {  
console.log(chalk.bold.red(`Archivo ${file} no borrado` + err))
} }) }) }) })
}

async function connectionUpdate(update) {
  const {connection, lastDisconnect, isNewLogin} = update;
  global.stopped = connection;
  if (isNewLogin)client.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && client?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    //console.log(await global.reloadHandler(true).catch(console.error));
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr != 0 && update.qr != undefined) {
    console.log(chalk.yellow('[ ℹ️ ] Escanea el código QR o introduce el código de emparejamiento en WhatsApp.'));
  }
  if (connection == 'open') {
    console.log(chalk.yellow('[ ℹ️ ] Conectado correctamente.'));
  }
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
       client.logger.error(`[ ⚠ ] جلسة سيئة، يرجى حذف المجلد ${global.authFile} والمسح مرة أخرى.`);
        //process.exit();
    } else if (reason === DisconnectReason.connectionClosed) {
       client.logger.warn(`[ ⚠ ] تم إغلاق الاتصال، جارٍ إعادة الاتصال...`);
        await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
       client.logger.warn(`[ ⚠ ] انقطع الاتصال بالخادم، جارٍ إعادة الاتصال...`);
        await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
       client.logger.error(`[ ⚠ ] تم استبدال الاتصال، وتم فتح جلسة جديدة أخرى.  الرجاء تسجيل الخروج من الجلسة الحالية أولا.`);
        //process.exit();
    } else if (reason === DisconnectReason.loggedOut) {
       client.logger.error(`[ ⚠ ] تم إغلاق الاتصال، يرجى حذف المجلد ${global.authFile} والمسح مرة أخرى.`);
        //process.exit();
    } else if (reason === DisconnectReason.restartRequired) {
       client.logger.info(`[ ⚠ ] يلزم إعادة التشغيل، يرجى إعادة تشغيل الخادم في حالة وجود أي مشكلة.`);
        await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.timedOut) {
       client.logger.warn(`[ ⚠ ] انتهت مهلة الاتصال، جارٍ إعادة الاتصال...`);
        await global.reloadHandler(true).catch(console.error);
    } else {
       client.logger.warn(`[ ⚠ ] سبب انقطاع الاتصال غير معروف. ${reason || ''}: ${connection || ''}`);
        await global.reloadHandler(true).catch(console.error);
    }
}
  /*if (connection == 'close') {
    console.log(chalk.yellow(`🚩ㅤConexion cerrada, por favor borre la carpeta ${global.authFile} y reescanee el codigo QR`));
  }*/
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function(restatclient) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restatclient) {
    const oldChats = global.client.chats;
    try {
      global.client.ws.close();
    } catch { }
   client.ev.removeAllListeners();
    global.client = makeWASocket(connectionOptions, {chats: oldChats});
    isInit = true;
  }
  if (!isInit) {
   client.ev.off('messages.upsert',client.handler);
   client.ev.off('group-participants.update',client.participantsUpdate);
   client.ev.off('groups.update',client.groupsUpdate);
   client.ev.off('message.delete',client.onDelete);
   client.ev.off('call',client.onCall);
   client.ev.off('connection.update',client.connectionUpdate);
   client.ev.off('creds.update',client.credsUpdate);
  }

 client.welcome = '👋 ¡ مرحب بيك !\nيا @user';
 client.bye = '👋 ¡ مع السلامة !\nيا @user';
 client.spromote = '*[ ℹ️ ] @user مبروك بقيت ادمن يابرو.*';
 client.sdemote = '*[ ℹ️ ] @user لو شايفينك راجل مكنوش نزلوك من الادمنز 😂.*';
 client.sDesc = '*[ ℹ️ ] La descripción del grupo ha sido modificada.*';
 client.sSubject = '*[ ℹ️ ] El nombre del grupo ha sido modificado.*';
 client.sIcon = '*[ ℹ️ ] Se ha cambiado la foto de perfil del grupo.*';
 client.sRevoke = '*[ ℹ️ ] El enlace de invitación al grupo ha sido restablecido.*';

 client.handler = handler.handler.bind(global.client);
 client.participantsUpdate = handler.participantsUpdate.bind(global.client);
 client.groupsUpdate = handler.groupsUpdate.bind(global.client);
 client.onDelete = handler.deleteUpdate.bind(global.client);
 client.onCall = handler.callUpdate.bind(global.client);
 client.connectionUpdate = connectionUpdate.bind(global.client);
 client.credsUpdate = saveCreds.bind(global.client, true);

  const currentDateTime = new Date();
  const messageDateTime = new Date(client.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(client.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(client.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

 client.ev.on('messages.upsert',client.handler);
 client.ev.on('group-participants.update',client.participantsUpdate);
 client.ev.on('groups.update',client.groupsUpdate);
 client.ev.on('message.delete',client.onDelete);
 client.ev.on('call',client.onCall);
 client.ev.on('connection.update',client.connectionUpdate);
 client.ev.on('creds.update',client.credsUpdate);
  isInit = false;
  return true;
};

/*

const pluginFolder = join(__dirname, './plugins');
const pluginFilter = filename => /\.js$/.test(filename);
global.plugins = {};

async function filesInit(folder) {
  for (let filename of readdirSync(folder).filter(pluginFilter)) {
    try {
      let file = join(folder, filename);
      const module = await import(file);
      global.plugins[file] = module.default || module;
    } catch (e) {
      console.error(e);
      delete global.plugins[filename];
    }
  }

  for (let subfolder of readdirSync(folder)) {
    const subfolderPath = join(folder, subfolder);
    if (statSync(subfolderPath).isDirectory()) {
      await filesInit(subfolderPath);
    }
  }
}

await filesInit(pluginFolder).then(_ => Object.keys(global.plugins)).catch(console.error);

*/

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
     client.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir))client.logger.info(` updated plugin - '${filename}'`);
      else {
       client.logger.warn(`deleted plugin - '${filename}'`);
        return delete global.plugins[filename];
      }
    } elseclient.logger.info(`new plugin - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err)client.logger.error(`syntax error while loading '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
       client.logger.error(`error require plugin '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
  Object.freeze(global.support);
}
setInterval(async () => {
  if (stopped === 'close' || !client || !client.user) return;
  const a = await clearTmp();
  //console.log(chalk.cyanBright(`\n▣───────────[ 𝙰𝚄𝚃𝙾𝙲𝙻𝙴𝙰𝚁TMP ]──────────────···\n│\n▣─❧ 𝙰𝚁𝙲𝙷𝙸𝚅𝙾𝚂 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙳𝙾𝚂 ✅\n│\n▣───────────────────────────────────────···\n`));
}, 180000);
setInterval(async () => {
  if (stopped === 'close' || !client || !client.user) return;
  await purgeSession();
  //console.log(chalk.cyanBright(`\n▣────────[ AUTOPURGESESSIONS ]───────────···\n│\n▣─❧ ARCHIVOS ELIMINADOS ✅\n│\n▣────────────────────────────────────···\n`));
}, 1000 * 60 * 60);
setInterval(async () => {
  if (stopped === 'close' || !client || !client.user) return;
  await purgeSessionSB();
  //console.log(chalk.cyanBright(`\n▣────────[ AUTO_PURGE_SESSIONS_SUB-BOTS ]───────────···\n│\n▣─❧ ARCHIVOS ELIMINADOS ✅\n│\n▣────────────────────────────────────···\n`));
}, 1000 * 60 * 60);
setInterval(async () => {
  if (stopped === 'close' || !client || !client.user) return;
  await purgeOldFiles();
  //console.log(chalk.cyanBright(`\n▣────────[ AUTO_PURGE_OLDFILES ]───────────···\n│\n▣─❧ ARCHIVOS ELIMINADOS ✅\n│\n▣────────────────────────────────────···\n`));
}, 1000 * 60 * 60);







setInterval(async () => {
  try {
    /*
    // جلب النص من الAPI الجديد
    const response = await fetch('https://ayah.nawafdev.com/api/dekr?types=pd%2Cqd&ignore_errors=false');
    const data = await response.json();

    // استخراج قيمة العنصر content من الاستجابة
    const ayahContent = data.content;
*/
    // الحصول على الوقت الحالي بتنسيق معين
    const currentTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
    });

    // إنشاء نص الحالة
    const bio = `[⏳️] 𝚃𝙸𝙼𝙴 : ${currentTime} ┊ ﴾قُلْ رَبِّ زِدْنِي عِلْمًا ﴿ ⇆ 𝓕𝓷 𓅃`;

    // قم بتحديث حالة البروفايل
   client.updateProfileStatus(bio).catch((err) => {
      console.error('Error updating profile status:', err);
    });
  } catch (error) {
    console.error('Error fetching and processing data:', error);
    // يمكنك إضافة تعليق للسجل في حالة حدوث خطأ
  }
}, 60000);



 //    ﴾ قُلْ رَبِّ زِدْنِي عِلْمًا ﴿ 




















function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'd ️', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('');
}
_quickTest().catch(console.error);
