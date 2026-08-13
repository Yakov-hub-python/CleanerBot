import { Telegraf } from 'telegraf';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error('❌ Токен не найден в переменных окружения (файл .env)');
    process.exit(1);
}

const bot = new Telegraf(TOKEN);
const PORT = process.env.PORT || 3000;

// ---------- МАССИВ ПЛОХИХ СЛОВ ----------
const badWords = [
    'хуй', 'хуя', 'хую', 'хуем', 'хуе', 'хуи', 'хуё',
    'пизд', 'пизда', 'пизде', 'пизду', 'пиздой', 'пиздо',
    'бля', 'блять', 'блядь', 'бляди', 'бляд',
    'ёб', 'еб', 'йоб', 'еба', 'ебу', 'ебё', 'ёба',
    'залуп', 'муд', 'манда', 'петух', 'гандон', 'пидр',
    'шлюх', 'курв', 'сук', 'суч',
    'нах', 'нахуй', 'похуй', 'схуя', 'дохуя', 'охуй',
    'ебать', 'ебаться', 'ебану', 'ебли', 'ебал', 'ебла',
    'пиздец', 'пизде', 'распизд', 'пиздю',
    'блядский', 'блядство', 'блядун',
    'заеб', 'заеба', 'доеб', 'отъеб', 'приеб',
    'мудак', 'мудила', 'мудло',
    'пидор', 'пидорас', 'пидрила',
    'гандон', 'гондон',
    'шмара', 'шлюха', 'курва',
    'сука', 'сучий', 'сучка',
    'проститут', 'простит'
];

// ---------- ФУНКЦИЯ ПРОВЕРКИ (с регулярным выражением) ----------
const badWordsRegex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'i');

function containsBadWords(text) {
    if (!text) return false;
    return badWordsRegex.test(text);
}

// ---------- ОБРАБОТЧИКИ БОТА ----------
bot.start((ctx) => {
    const userName = ctx.from.first_name || 'друг';
    ctx.reply(
        `Привет, ${userName}! 👋\n` +
        `Я бот-цензор. Удаляю сообщения с матом в чате.\n` +
        `Для работы дайте мне права администратора!`
    );
});

bot.on('message', async (ctx) => {
    if (ctx.from.is_bot) return;

    const text = ctx.message.text || ctx.message.caption || '';
    if (!text || text.startsWith('/')) return;

    if (!containsBadWords(text)) return;

    try {
        await ctx.deleteMessage();
        await ctx.reply(`⚠️ ${ctx.from.first_name}, пожалуйста, не используйте нецензурную лексику!`);
        console.log(`🚨 Нарушение от ${ctx.from.id} (${ctx.from.username || 'без юзернейма'}): ${text}`);
    } catch (err) {
        console.error('Ошибка при удалении:', err.message);
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
        console.log(`🚨 Нарушение (edited) от ${message.from.id}: ${text}`);
    } catch (err) {
        console.error('Ошибка при удалении edited:', err.message);
    }
});

// ---------- ЗАПУСК БОТА (POLLING) ----------
bot.launch()
    .then(() => console.log('🤖 Бот запущен и защищает чаты от мата!'))
    .catch(err => {
        console.error('❌ Ошибка запуска бота:', err);
        process.exit(1);
    });

// ---------- HTTP СЕРВЕР ДЛЯ HEALTH CHECK (вместо Express) ----------
const server = http.createServer((req, res) => {
    // Обрабатываем только GET запросы к /health
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
    } else {
        // Для всех остальных запросов отдаём 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`💓 Health check сервер запущен на порту ${PORT}`);
    console.log(`🔗 Проверить статус: http://localhost:${PORT}/health`);
});

// ---------- ГРАЦИОЗНОЕ ЗАВЕРШЕНИЕ ----------
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    server.close(() => process.exit(0));
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    server.close(() => process.exit(0));
});