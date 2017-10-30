// const biddingfeathers = require('./biddingfeathers/biddingfeathers.service.js');

// const bidManagementAllAuctionService = require('./bid-management-all-auction-service/bid-management-all-auction-service.service.js');
//
// const bidManagementAllBidsService = require('./bid-management-all-bids-service/bid-management-all-bids-service.service.js');
//
// const bidManagementAllUsers = require('./bid-management-all-users/bid-management-all-users.service.js');



const bidManagementAllAuctionServices = require('./bid-management-all-auction-services/bid-management-all-auction-services.service.js');



const bidManagementAllBidsServices = require('./bid-management-all-bids-services/bid-management-all-bids-services.service.js');







const bidManagementAllUsersServices = require('./bid-management-all-users-services/bid-management-all-users-services.service.js');


const bidManagementPlaceBidsServices = require('./bid-management-place-bids-services/bid-management-place-bids-services.service.js');




module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  // app.configure(biddingfeathers);

  // app.configure(bidManagementAllAuctionService);
  // app.configure(bidManagementAllBidsService);
  // app.configure(bidManagementAllUsers);
  
  app.configure(bidManagementAllAuctionServices);
  app.configure(bidManagementAllBidsServices);

  app.configure(bidManagementAllUsersServices);

  app.configure(bidManagementPlaceBidsServices);
};
