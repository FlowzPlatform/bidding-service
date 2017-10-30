const assert = require('assert');
const app = require('../../src/app');

describe('\'newStudent\' service', () => {
  it('registered the service', () => {
    const service = app.service('new-student');

    assert.ok(service, 'Registered the service');
  });
});
