const Brain = require('./brain');
const Util = require('./util');
const log = require('loglevel');

// TODO: move to config
const LEARN_ROLES = [
  '846033457510744105',
  '846050734180925510',
  '848427417264717834',
];

class MessageHandler {
  constructor(config, client) {
    this.config = config;
    this.client = client;
    this.brain = new Brain(config.brain);
  }

  /**
   * @param {string} message
   * @returns Promise<boolean>
   */
  async handleForgetMessage(message) {
    const forgetCmd = message.match(/^forget\s(.+)$/);
    if (forgetCmd && forgetCmd.length > 0) {
      log.debug(`forgetting ${forgetCmd[1]}`);
      await this.brain.forget(forgetCmd[1]);
      return true;
    }
    return false;
  }

  /**
   * @param {string} message
   * @returns Promise<boolean>
   */
  async handleLearning(message) {
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
      log.debug(`setting ${subject}, ${verb}, ${predicate}`);
      await this.brain.learn(subject, predicate, verb);

      return true;
    }

    return false;
  }

  /**
   * @param {object} msgObject
   * @returns {Promise<void>}
   */
  async handleMessage(msgObject) {
    const { member: { roles } } = msgObject;
    // TODO: handle private message
    const { mentionId, message } = Util.parseMessage(msgObject.content);
    if (!message) {
      return;
    }

    // they're addressing us! (or addressing mode is disabled)
    if (!this.config.brain.addressing || mentionId === this.client.user.id) {
      const hasAdminRole = LEARN_ROLES.find((r) => roles.cache.has(r));

      if (hasAdminRole && (await this.handleLearning(message))) {
        // TODO: acknowledge?
        // if handled, return
        return;
      }


      if (hasAdminRole && (await this.handleForgetMessage(message))) {
        // if handled, return
        return;
      }

      // fetch see if we can find any info
      log.debug(`fetching datum for ${message}`);
      const response = await this.brain.get(message);

      if (response) {
        log.debug(`response: ${response}`);

        // TODO: address them back
        msgObject.channel.send(response);
      }
    }
  }
}

module.exports = MessageHandler;
