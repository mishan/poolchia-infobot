const RedisBrain = require('./RedisBrain');

class Brain {
  constructor(config) {
    switch (config.backend) {
    case 'redis':
      this.store = new RedisBrain(config.redis);
      break;
    }
  }

  /**
   * @param {string} subject
   * @returns {Promise<Object|null>}
   */
  async get(subject) {
    const datum = await this.store.get(subject);

    if (datum) {
      return Brain.getMessageFromDatum(subject, datum);
    }

    return null;
  }

  /**
   * @param {string} subject
   * @param {string} predicate
   * @param {string} verb
   * @param {string} author
   * @returns {Promise<void>}
   */
  async learn(subject, predicate, verb, author) {
    await this.store.learn(subject, predicate, verb, author);
  }

  /**
   * @param {string} subject
   * @returns {Promise<void>}
   */
  async forget(subject) {
    await this.store.forget(subject);
  }

  // TODO: move to common "Brain" class?
  /**
   * @param {string} subject
   * @param {Object} datum
   * @returns {string}
   */
  static getMessageFromDatum(subject, datum) {
    let { predicate } = datum;

    if (predicate.indexOf('|') >= 0) {
      const predicates = predicate.split('|');
      predicate = predicates[Math.floor(Math.random() * predicates.length)];
    }

    if (predicate.startsWith('<reply>')) {
      return predicate.slice(7);
    } else {
      return `${subject} ${datum.verb} ${predicate}`;
    }
  }
}

module.exports = Brain;
