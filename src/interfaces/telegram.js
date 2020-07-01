const R = require("ramda");
const Kefir = require("kefir");

const Secrets = require("../model/secrets");
const Events = require("../events/events");

const Interfaces = require("../../config/interfaces.json");
const TelegramBot = require('node-telegram-bot-api');
const chatIds = Interfaces.telegram.chatIds;
const token = "1121380710:AAHXfxRSVNZFN_UZ3bbxwQHiQmeEMkQrMvU";
const bot = new TelegramBot(token, {polling: true});

const isNotifyUserEvent = Events.isEvent( "NotifyUser");
const sendMessageToChat = chat => message => bot.sendMessage(chat, message);
const sendToAllChats = message => chatIds.forEach(id => sendMessageToChat(id)(message));

const input = new Kefir.pool();

input.filter(isNotifyUserEvent)
    .map(R.prop("message"))
    .onValue(sendToAllChats);

module.exports = {
    input,
};
