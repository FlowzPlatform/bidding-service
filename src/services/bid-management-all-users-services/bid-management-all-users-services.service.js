// Initializes the `bidManagementAllUsersServices` service on path `/users`
const createService = require('feathers-rethinkdb');
const hooks = require('./bid-management-all-users-services.hooks');
const filters = require('./bid-management-all-users-services.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'bid_management_all_users_services',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/users', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('users');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
