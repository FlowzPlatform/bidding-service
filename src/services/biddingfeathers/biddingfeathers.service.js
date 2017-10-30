const createService = require('feathers-rethinkdb');
const filters = require('./biddingfeathers.filters');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const feathers = require('feathers');
const hooks = require('feathers-hooks');
const r = require('rethinkdb');
module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');
  const options = {
    name: 'biddingfeathers',
    Model,
    paginate
  };

  let checkStatus = true;
  let connection ;
  r.connect({ host: app.get('rdb_host'), port: app.get('rdb_port'), db : app.get('rdb_db') }, function(err, conn) {
    if(err) throw err;
    connection = conn
  })

  // Initialize our service with any options it requires
  app.use('/biddingfeathers', createService(options));

  //Customize hooks

  //hooks for insert a new blank bids array
  createNewAuctionHook = (hook) => {
    hook.data.bids = [];
    hook.data.createdAt = new Date();
  }

  //hooks for check random
  checkRandom = (hook) => {
    hook.data.bids = [];
    if (hook.data.title == "") {
      throw new Error('title text can not be empty');
    }
  }

  //  authenticated user check

  // isAuthenticated = (hook) =>{
  //   auth.hooks.authenticate("jwt")
  // }


   addBids = (hook) => {

     console.log('gook'+JSON.stringify(hook.data));
     //hook.data.currentBid = parseInt(hook.data.currentBid) + parseInt(hook.data.BidIncrementedBy) ;

     let remainingBidAmount = hook.data.upperLimit - hook.data.currentBid;
     console.log('remainingBidAmount' , remainingBidAmount);
     r.table("biddingfeathers").filter({
         'id': hook.id
     }).update({
         'bids': r.row('bids').append({
          bidderId: hook.data.bidderId,
           currentBid: hook.data.currentBid,
           previousBid : hook.data.previousBid,
           remainingBidAmount : remainingBidAmount,
           isHighest: hook.data.isHighest,
           numOfAllowedBids : hook.data.numOfAllowedBids,
           isAuto : hook.data.isAuto
         })
     }).run(connection, function(err, cursor) {
           if (err) throw err;
           //console.log(cursor.toArray());
     }).then(function () {
       console.log("new Bid Placed");
     })

     throw new Error('stop insert');
   }

   autobid = (data) => {


     if (checkStatus) {
       checkStatus = false;
       console.log("After hook called >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
       console.log('autobid' , data.data);
       console.log('autobid bids array' , JSON.stringify(data.data.bids));

       let globalCurrentWinner;
       let globalCurrentHighest;

       var index = data.data.bids.length - 1;
      if( data.data.TotalBids == 0 ){
        console.log(1 , index);
          if( data.data.bids[index].remainingBidAmount >= data.data.BidIncrementedBy )
          {
            console.log(2);
              console.log("index" , index);
              newTotalBids = parseInt(data.data.TotalBids) + 1;
              if( data.data.bids[index].isAuto )
              {
                  console.log(3);
                  //data.data.bids[index].numOfAllowedBids--;
                  data.data.bids[index].remainingBidAmount -= parseInt(data.data.BidIncrementedBy);
                  console.log('numOfAllowedBids --' , data.data.bids[index].numOfAllowedBids);
                  console.log('remainingBidAmount ', data.data.bids[index].remainingBidAmount);
                  r.table("biddingfeathers").filter({
                      'id': data.id
                  }).update({
                    HighestBidderIndex : index,
                    TotalBids : newTotalBids,
                    bids: r.row('bids').changeAt(index,
                      r.row('bids').nth(index).merge({
                        numOfAllowedBids: parseInt(data.data.bids[index].numOfAllowedBids) -1,
                        remainingBidAmount :data.data.bids[index].remainingBidAmount
                    }))
                  }).run(connection, function(err, cursor) {
                        if (err) throw err;
                        console.log(cursor);
                  }).then(function () {
                    //return false;
                  })
              }else
              {
                console.log("instant user");
                r.table("biddingfeathers").filter({
                    'id': data.id
                }).update({
                  HighestBidderIndex : index,
                  TotalBids : newTotalBids
                }).run(connection, function(err, cursor) {
                      if (err) throw err;
                      console.log(cursor);
                }).then(function () {
                  console.log("changed2");
                })
              }
          }else
          {
            console.log("increase upper limit to bid");
          }
      } else
      {
        console.log(4);
          currentHighest = data.data.HighestBidderIndex;

          if( ( data.data.bids[index].remainingBidAmount >= data.data.BidIncrementedBy ) || ( !data.data.bids[index].isAuto ) )
          {
              console.log(5);
              if( data.data.bids[currentHighest].isAuto )
              {
                  console.log(6);
                  bidsPossible1 = Math.round( data.data.bids[currentHighest].remainingBidAmount / ( data.data.BidIncrementedBy * 2 ) );
                  min1 = data.data.bids[currentHighest].numOfAllowedBids > bidsPossible1 ? bidsPossible1 : data.data.bids[currentHighest].numOfAllowedBids;
              } else
              {
                console.log(7);
                  min1 = 0;
              }

              if( data.data.bids[index].isAuto )
              {
                console.log(8);
                  bidsPossible2 = Math.round( data.data.bids[index].remainingBidAmount / ( data.data.BidIncrementedBy * 2 ) );
                  min2 = data.data.bids[index].numOfAllowedBids > bidsPossible2 ? bidsPossible2 : data.data.bids[index].numOfAllowedBids;
              } else
              {
                console.log(9);
                  min2 = 1;
              }

              if( min1 < 0 )
              {
                  console.log(10);
                  min1 = 0;
              }

              currentWinner = min1 < min2 ? index : currentHighest;
              minLoop = min1 < min2 ? min1 : min2;
              globalCurrentWinner =currentWinner;

              if( currentWinner == currentHighest )
              {
                console.log(11);
                  currentIncrement = parseInt(data.data.BidIncrementedBy) * min2 * 2;
              } else
              {
                console.log(12);
                  currentIncrement = parseInt(data.data.BidIncrementedBy) * ( ( min1 * 2 ) + 1 ) ;
                  if( !data.data.bids[currentHighest].isAuto )
                  {
                    console.log(13);
                      minLoop++;
                  }
                  //data.data.HighestBidderId = data.data.bids[index].bidderId;
                  //data.data.HighestBidderIndex = index;//update
              }

              if(  currentWinner != currentHighest )
              // Previous winner is not the winner at current bid
              {

                if (data.data.bids[currentWinner].isAuto) {
                  data.data.bids[currentWinner].numOfAllowedBids -= ( minLoop + 1 );  //update
                  data.data.bids[currentWinner].remainingBidAmount -= ( currentIncrement + parseInt(data.data.BidIncrementedBy) ); //update

                  console.log('currentWinner', currentWinner);
                  console.log('currentHighest',currentHighest);

                  r.table("biddingfeathers").filter({
                      'id': data.id
                  }).update({
                    HighestBidderIndex : currentWinner,
                    TotalBids : parseInt(data.data.TotalBids) + 1,
                    bids: r.row('bids').changeAt(currentWinner,
                      r.row('bids').nth(currentWinner).merge({
                        numOfAllowedBids: data.data.bids[currentWinner].numOfAllowedBids--,
                        remainingBidAmount :data.data.bids[currentWinner].remainingBidAmount
                    }))
                  }).run(connection, function(err, cursor) {
                        if (err) throw err;
                        console.log(cursor);
                  }).then(function () {
                    console.log("changed3");
                  })
                }
                else {
                  r.table("biddingfeathers").filter({
                      'id': data.id
                  }).update({
                    HighestBidderIndex : currentWinner,
                    TotalBids : parseInt(data.data.TotalBids) + 1,
                  }).run(connection, function(err, cursor) {
                        if (err) throw err;
                        console.log(cursor);
                  }).then(function () {
                    console.log("changed3");
                  })
                }
                console.log('data.data.bids[currentWinner].numOfAllowedBids',data.data.bids[currentWinner].numOfAllowedBids);

                console.log(14);

              }
              else if( data.data.bids[currentWinner].isAuto ){
                  console.log(14);
                    data.data.bids[currentWinner].numOfAllowedBids -= minLoop;  //update
                    data.data.bids[currentWinner].remainingBidAmount -= ( parseInt(currentIncrement) ); //update

                    console.log('currentWinner', currentWinner);
                    console.log('data.data.bids[currentWinner].remainingBidAmount >>>>>',data.data.bids[currentWinner].remainingBidAmount);

                    r.table("biddingfeathers").filter({
                        'id': data.id
                    }).update({
                      TotalBids : parseInt(data.data.TotalBids) + 1,
                      bids: r.row('bids').changeAt(currentWinner,
                        r.row('bids').nth(currentWinner).merge({
                          numOfAllowedBids: data.data.bids[currentWinner].numOfAllowedBids--,
                          remainingBidAmount :data.data.bids[currentWinner].remainingBidAmount
                      }))
                    }).run(connection, function(err, cursor) {
                          if (err) throw err;
                          console.log(cursor);
                    }).then(function () {
                      console.log("changed3");
                    })

                    console.log('data.data.bids[currentWinner].numOfAllowedBids',data.data.bids[currentWinner].numOfAllowedBids);
              }
        }
          // console.log(">>data.data.HighestBidderIndex",data.data.HighestBidderIndex);
          // console.log("data.data.bids[currentWinner].numOfAllowedBids",currentWinner);
          // // console.log('data.data.bids[currentHighest].remainingBidAmount',data.data.bids[currentHighest].remainingBidAmount);
          // newTotalBids = parseInt(data.data.TotalBids) + 1;
          // console.log("//totalbids ++",newTotalBids);
      }
      console.log(16);

     }else
     {
       checkStatus = true;
     }



   }



  const service = app.service('biddingfeathers');


  // service.hooks({
  //   before(hook){
  //     auth.hooks.authenticate(['jwt'])
  //   }
  // });

  service.hooks({
  before: {
    all: [
    //  hook => isAuthenticated(hook),
    //auth.hooks.authenticate(['jwt'])
    ],
    find: [
      // Use ES6 arrow functions
      hook => console.log('before find hook 1 ran'),
      hook => console.log('before find hook 2 ran')
    ],
    get: [ ],
    create: [
      hook => createNewAuctionHook(hook),
      hook => checkRandom(hook)
    ],
    update: [],
    patch: [
      hook => addBids(hook)
    ],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      hook => autobid(hook)
    ],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
});




  //
  // service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
