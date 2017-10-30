const assert = require('assert');
const app = require('../../src/app');

describe('\'bidManagementAllBidsServices\' service', () => {
  it('registered the service', () => {
    const service = app.service('bids');

    assert.ok(service, 'Registered the service');
  });
});
