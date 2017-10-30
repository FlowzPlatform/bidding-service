const assert = require('assert');
const app = require('../../src/app');

describe('\'biddingfeathers\' service', () => {
  it('registered the service', () => {
    const service = app.service('biddingfeathers');

    assert.ok(service, 'Registered the service');
  });
});
