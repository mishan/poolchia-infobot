const Discord = require('discord.js');
const log = require('loglevel');
const MessageHandler = require('./lib/MessageHandler');
const config = require('./config');

log.setLevel(config.logLevel);
const client = new Discord.Client();

client.on('ready', () => {
  log.debug(`Logged in as ${client.user.tag}!`);
});

const messageHandler = new MessageHandler(config, client);
client.on('message', messageHandler.handleMessage.bind(messageHandler));

client.login(config.discord.token);
