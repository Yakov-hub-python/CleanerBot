import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error('❌ Токен не найден в переменных окружения (файл .env)');
    process.exit(1);
}

const bot = new Telegraf(TOKEN);
const badWords = [
    'хуй', 'хуя', 'хую', 'хуем', 'хуе', 'хуи',
    'пизда', 'пизды', 'пизде', 'пизду', 'пиздой',
    'блядь', 'бляди', 'блядью', 'блядский',
    'ебал', 'ебала', 'ебали', 'ебать', 'ебучий',
    'гандон', 'гандона', 'гандону',
    'мудила', 'мудило', 'мудень',
    'пидор', 'пидора', 'пидору', 'пидорский',
    'сучка', 'сучки', 'сучку', 'сучкой',
    'шлюха', 'шлюхи', 'шлюху', 'шлюхой',
    'залупа', 'залупы', 'залупу',
    'пездюк', 'пездюка',
    'xуй', 'xуя',
    'пuзда',
    'бляд', 'блять', 'блят',
    'ебат', 'ебац', 'ебатся',
    'пидр', 'пидра',
    'сукa', 'сукка', 'сука',
    "хуй", "хуя", "хую", "хуем", "хуе", "хуи", "хуё",
    "пизд", "пизда", "пизде", "пизду", "пиздой", "пиздо",
    "бля", "блять", "блядь", "бляди", "бляд",
    "ёб", "еб", "йоб", "еба", "ебу", "ебё", "ёба",
    "залуп", "муд", "манда", "петух", "гандон", "пидр",
    "шлюх", "курв", "сук", "суч",
    "нах", "нахуй", "похуй", "схуя", "дохуя", "охуй",
    "ебать", "ебаться", "ебану", "ебли", "ебал", "ебла",
    "пиздец", "пизде", "распизд", "пиздю",
    "блядский", "блядство", "блядун",
    "заеб", "заеба", "доеб", "отъеб", "приеб",
    "мудак", "мудила", "мудло",
    "пидор", "пидорас", "пидрила",
    "гандон", "гондон",
    "шмара", "шлюха", "курва",
    "сука", "сучий", "сучка",
    "проститут", "простит"
];
function containsBadWords(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word.toLowerCase()));
}
bot.start((ctx) => {
    const userName = ctx.from.first_name || 'друг';
    ctx.reply(
        `Привет, ${userName}! 👋\n` +
        `Я тестовый бот на Telegraf.js.\n` +
        `Для полной работоспособности дайте мне права администратора\n` +
        `и разрешение на удаление сообщений. Больше ничего не нужно!`
    );
});
bot.on('text', async (ctx) => {
    if (ctx.from.is_bot) return;
    const text = ctx.message.text || '';
    if (!text) return;
    if (text.startsWith('/')) return;
    if (!containsBadWords(text)) return;
    try {
        await ctx.deleteMessage();
        await ctx.reply(`⚠️ ${ctx.from.first_name}, пожалуйста, не используйте нецензурную лексику!`);
        console.log(`🚨 Нарушение от ${ctx.from.id} (${ctx.from.username || 'без юзернейма'}) в ${chatType}: ${text}`);
    } catch (err) {
        console.error('Ошибка при обработке сообщения:', err.message);
    }
});
bot.on('edited_message', async (ctx) => {
    if (ctx.from.is_bot) return;
    const message = ctx.editedMessage;
    const text = message.text || message.caption || '';
    if (!text) return;
    if (!containsBadWords(text)) return;
    try {
        await ctx.deleteMessage();
        await ctx.reply(`⚠️ ${message.from.first_name}, пожалуйста, не используйте нецензурную лексику!`);
        console.log(`🚨 Нарушение (edited) от ${message.from.id} (${message.from.username || 'без юзернейма'}) в ${chatType}: ${text}`);
    } catch (err) {
        console.error('Ошибка при обработке отредактированного сообщения:', err.message);
    }
});
// ===== HTTP-СЕРВЕР ДЛЯ RENDER =====
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Бот "Античный Градоначальник" работает! 🏛️');
});
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`✅ HTTP-сервер запущен на порту ${PORT}`));

bot.launch()
    .then(() => console.log('🤖 Бот запущен и защищает чаты от мата!'))
    .catch(err => {
        console.error('❌ Ошибка запуска:', err);
        process.exit(1);
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
