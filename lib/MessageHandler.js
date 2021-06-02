const Brain = require('./brain');
const Util = require('./util');
const log = require('loglevel');

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

  hasAdminRole(msgObject) {
    const { member: { roles } } = msgObject;

    return this.config.adminRoles.find((r) => roles.cache.has(r));
  }

  isLearningEnabled(hasAdminRole) {
    const { learning } = this.config.brain;
    return learning.enabled
      && (!learning.restricted
          || (learning.restricted && hasAdminRole));
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
    // TODO: handle private message
    const { mentionId, message } = Util.parseMessage(msgObject.content);
    if (!message) {
      return;
    }

    // they're addressing us! (or addressing mode is disabled)
    if (!this.config.brain.addressing || mentionId === this.client.user.id) {
      const hasAdminRole = this.hasAdminRole(msgObject);
      const learningEnabled = this.isLearningEnabled(hasAdminRole);

      if (learningEnabled && (await this.handleLearning(message))) {
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
