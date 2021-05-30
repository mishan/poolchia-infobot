class Util {
  /**
   * @param {string} msg
   * @returns {Object}
   */
  static parseMessage(msg) {
    const sanitizedMsg = msg.replace(/\?+$/g, '');
    const matches = sanitizedMsg.match(/^(<@!?(\d+)> )?(.*)$/);

    return {
      mentionId: matches && matches[2],
      message: matches && matches[3],
    };
  }

  /**
   * Returns the ID from a mention string
   *
   * @param {string} mention e.g. <@12345>
   * @returns {string|null}
   */
  static getUserFromMention(mention) {
    if (!mention) {
      return null;
    }

    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);

      if (mention.startsWith('!')) {
	mention = mention.slice(1);
      }

      return mention;
    }

    return null;
  }

  /**
   * Returns the ID from a mention if the message begins with
   * a mention
   *
   * @param {string} message
   * @returns {string|null}
   */
  static getAddressedUser(message) {
    if (!message.startsWith('<@')) {
      return null;
    }

    const endIdx = message.indexOf('>');
    const mention = message.slice(0, endIdx + 1);

    return Util.getUserFromMention(mention);
  }
}

module.exports = Util;
