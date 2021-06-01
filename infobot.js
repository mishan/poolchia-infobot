const Discord = require('discord.js');
const log = require('loglevel');

const Brain = require('./lib/brain');
const Util = require('./lib/util');
const config = require('./config');

log.setLevel(config.logLevel);
const client = new Discord.Client();
const brain = new Brain(config.brain);

const LEARN_ROLES = [
  '846033457510744105',
  '846050734180925510',
  '848427417264717834',
];

client.on('ready', () => {
  log.debug(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  const { member: { roles } } = msg;
  // TODO: handle private message
  const { mentionId, message } = Util.parseMessage(msg.content);
  if (!message) {
    return;
  }

  // they're addressing us! (or addressing mode is disabled)
  if (!config.brain.addressing || mentionId === client.user.id) {
    // check if it matches an is or are structure
    let subject;
    let predicate;
    let verb;
    if (message.indexOf(' is ') > 0) {
      ([subject, predicate] = message.split(' is '));
      verb = 'is';
    } else if (message.indexOf(' are ') > 0) {
      ([subject, predicate] = message.split(' are '));
      verb = 'are';
    }
    if (subject && predicate) {
      const hasLearnRole = LEARN_ROLES.find((r) => roles.cache.has(r));

      if (hasLearnRole) {
        log.debug(`setting ${subject}, ${verb}, ${predicate}`);
        await brain.learn(subject, predicate, verb);
      }

      // TODO: acknowledge?
      return;
    }

    // fetch see if we can find any info
    log.debug(`fetching datum for ${message}`);
    const response = await brain.get(message);

    if (response) {
      log.debug(`response: ${response}`);

      // TODO: address them back
      msg.channel.send(response);
    }
  }
});

client.login(config.discord.token);
