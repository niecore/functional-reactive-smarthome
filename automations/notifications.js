const TelegramBot = require('node-telegram-bot-api');
const Credentials = require('../config/credentials.json');

const token = Credentials.telegram_api_token;
const bot = new TelegramBot(token, {polling: true});
const chatIds = Credentials.telegram_chat_ids;

module.exports.sendMessage = (message) => {
    chatIds.forEach(id =>
        bot.sendMessage(id, message)
    );
};
