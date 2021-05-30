const IORedis = require('ioredis');
const { Base64 } = require('js-base64');

class RedisBrain {
  constructor(config) {
    this.redis = new IORedis({ host: config.host,
                               port: config.port });
  }

  /**
   * Returns the key for a subject
   *
   * @param {string} subject
   * @returns {string}
   */
  static getKey(subject) {
    return Base64.encode(subject);
  }

  /**
   * @param {string} subject
   * @returns {Promise<Object|null>}
   */
  async get(subject) {
    const key = RedisBrain.getKey(subject);
    const datum = await this.redis.hgetall(key);
    if (Object.keys(datum).length === 0) {
      return null;
    }
    return datum;
  }

  /**
   * @param {string} subject
   * @param {string} predicate
   * @param {string} verb
   * @param {string} author
   * @returns {Promise<void>}
   */
  async learn(subject, predicate, verb, author) {
    const key = RedisBrain.getKey(subject);
    await this.redis.hset(
      key,
      'predicate',
      predicate,
      'verb',
      verb,
      'author',
      author,
    );
  }

  /**
   * @param {string} subject
   * @returns {Promise<void>}
   */
  async forget(subject) {
    const key = RedisBrain.getKey(subject);
    await this.redis.del(key);
  }
}

module.exports = RedisBrain;
