const assert = require('assert');
const app = require('../../src/app');

describe('\'bidManagementAllUsers\' service', () => {
  it('registered the service', () => {
    const service = app.service('bid-management-all-users');

    assert.ok(service, 'Registered the service');
  });
});
