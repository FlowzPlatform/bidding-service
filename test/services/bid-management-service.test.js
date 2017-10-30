const assert = require('assert');
const app = require('../../src/app');

describe('\'bid_management_service\' service', () => {
  it('registered the service', () => {
    const service = app.service('auctions');

    assert.ok(service, 'Registered the service');
  });
});
