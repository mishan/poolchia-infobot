const assert = require('assert');
const Util = require('../../lib/util');

describe('Util', () => {
  describe('getUserFromMention', () => {
    it('ignores messages without mentions', () => {
      const result = Util.getUserFromMention('hello world!');

      assert.strictEqual(result, null);
    });
    it('ignores mentions without an end tag', () => {
      const result = Util.getUserFromMention('<@123 invalid mention');

      assert.strictEqual(result, null);
    });
    it('entire string must be a mention', () => {
      const result = Util.getUserFromMention('<@123> other stuff');

      assert.strictEqual(result, null);
    });
    it('extracts a user ID from a mention', () => {
      const result = Util.getUserFromMention('<@123>');

      assert.strictEqual(result, '123');
    });
  });

  describe('getAddressedUser', () => {
    it('returns null if no mention', () => {
      const result = Util.getAddressedUser('hello world');

      assert.strictEqual(result, null);
    });
    it('returns null if mention missing close tag', () => {
      const result = Util.getAddressedUser('<@123 hello world');

      assert.strictEqual(result, null);
    });
    it('extracts a user ID from a mention', () => {
      const result = Util.getAddressedUser('<@123> hello world');

      assert.strictEqual(result, '123');
    });
  });

  describe('parseMessage', () => {
    it('returns the message', () => {
      const parsedMsg = Util.parseMessage('hello world');

      assert.deepStrictEqual(parsedMsg, {
        mentionId: undefined,
        message: 'hello world',
      });
    });
    it('returns the message and mentionId', () => {
      const parsedMsg = Util.parseMessage('<@123> hello world');

      assert.deepStrictEqual(parsedMsg, {
        mentionId: '123',
        message: 'hello world',
      });
    });
    it('removes ?s', () => {
      const parsedMsg = Util.parseMessage('<@123> good idea??');

      assert.deepStrictEqual(parsedMsg, {
        mentionId: '123',
        message: 'good idea',
      });
    });
  });
});
