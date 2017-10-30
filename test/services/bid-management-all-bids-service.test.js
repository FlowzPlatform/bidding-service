const assert = require('assert');
const app = require('../../src/app');

describe('\'bidManagementAllBidsService\' service', () => {
  it('registered the service', () => {
    const service = app.service('bid-management-all-bids-service');

    assert.ok(service, 'Registered the service');
  });
});
