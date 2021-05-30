const assert = require('assert');
const Brain = require('../../../lib/brain');

describe('Brain', () => {
  describe('getMessageFromDatum', () => {
    it('constructs a response from the datum', () => {
      const response = Brain.getMessageFromDatum('all your base', {
        predicate: 'belong to us',
        verb: 'are',
      });

      assert.strictEqual(response, 'all your base are belong to us');
    });
    it('handles <reply>', () => {
      const response = Brain.getMessageFromDatum('all your base', {
        predicate: '<reply>[img-timeline]',
        verb: 'are',
      });

      assert.strictEqual(response, '[img-timeline]');
    });
  });
});
