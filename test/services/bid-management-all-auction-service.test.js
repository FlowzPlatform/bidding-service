const assert = require('assert');
const app = require('../../src/app');

describe('\'bidManagementAllAuctionService\' service', () => {
  it('registered the service', () => {
    const service = app.service('bid-management-all-auction-service');

    assert.ok(service, 'Registered the service');
  });
});
