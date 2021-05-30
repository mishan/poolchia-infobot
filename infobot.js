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
  // they're addressing us!
  if (mentionId === client.user.id) {
    // they are teaching us something
    const matches = message.match(/^(([\w\d]+)\s)+(is|are)\s(.+)$/);
    log.debug(`matches = ${matches}`);
    if (matches && matches.length > 0) {
      const hasLearnRole = LEARN_ROLES.find((r) => roles.cache.has(r));

      if (hasLearnRole) {
        const [,,subj, verb, pred] = matches;
        log.debug(`setting ${subj}, ${verb}, ${pred}`);
        await brain.learn(subj, pred, verb);
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
