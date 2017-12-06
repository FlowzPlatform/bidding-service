// Initializes the `bidManagementAllBidsServices` service on path `/bids`
const createService = require('feathers-rethinkdb');
const hooks = require('./bid-management-all-bids-services.hooks');
const filters = require('./bid-management-all-bids-services.filters');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const feathers = require('feathers');
const path = require('path');
const errors = require('feathers-errors');
//import errors from 'feathers-errors';
const swagger = require('feathers-swagger');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const r = require('rethinkdb');
const config = require('config');
const fs = require('fs');

const featherApp = feathers();
let checkStatus = true;
let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null
let rauth = process.env.rauth ? process.env.rauth : null
module.exports = function() {
    const app = this;
    const Model = app.get('rethinkdbClient');
    const paginate = app.get('paginate');

    const options = {
        name: 'bid_management_all_bids_services',
        Model,
        paginate
    };

    let connection;
    console.log(" ################### " , config.get('rdb_host') , " ########### " , config.get('rdb_port') , "###", config.get('rdb_db'));
    r.connect({
        host: config.get('rdb_host'),
        port: config.get('rdb_port'),
        authKey: rauth,
        ssl: ssl,
        db: config.get('rdb_db')
    }, function(err, conn) {
        if (err) throw err;
        connection = conn
    })





    // Initialize our service with any options it requires
    app.use('/bids', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('bids');



    app.configure(rest())
        .configure(swagger({
            docsPath: '/docs',
            prefix: /api\/v\d\//,
            versionPrefix: /v\d/,
            uiIndex: true,
            info: {
                title: 'A test',
                description: 'A description'
            }
        }))
        .use('/bids', service)

        app.use(function (err, req, res, next) {
              console.error("++++++++++++++++++++" , err);
              res.send(err);
        });

        let biddingData ;
        let auctionData ;

        let bidderCurrentBid;
        let bidderPreviousBid;

        let bidIncrementByBidderValue ;
        let remainingBiddingAmountValue ;
        let previousBidValue ;


    //beforePlaceBid = (hook) => {


    // async function beforePlaceBid(hook) {
    //     biddingData = hook.data;
    //     await r.table("bid_management_all_auction_services").get(hook.data.auctionId).run(connection, function(err, result) {
    //       auctionData = result;
    //     })
    //
    //     console.log("biddingData ",biddingData);
    //     console.log("auctionData" ,auctionData);
    //
    //
    //     if ( auctionData.allBids.length == 0 ) //  first bid
    //     {
    //
    //           //////////////////////////////////////////////
    //           //                                          //
    //           // if bidder has not set bidder.currentBid, //
    //           // Set currentBid as auction's base price   //
    //           //                                          //
    //           //////////////////////////////////////////////
    //
    //           if (auctionData.basePrice > biddingData.placedBidByBidder)
    //           {
    //             throw new Error ({"errorMessage" : "" , "errorCode" : ""})
    //           } else if( biddingData.placedBidByBidder == "" || biddingData.placedBidByBidder == "undefined" )
    //           {
    //             bidderCurrentBid =  auctionData.basePrice;
    //           } else
    //           {
    //             bidderCurrentBid =  biddingData.placedBidByBidder;
    //           }
    //
    //           previousBidValue = 0;
    //           if (  auctionData.isIncrementSetByOwner == false   )
    //           {
    //             if (biddingData.isAuto == true) // owner did not set increament and bidder is auto bidder
    //             {
    //               if ( biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder <= 0 )
    //               {
    //                 throw new Error ({"errorMessage": "Bidders bid increment should be set and greater than 0"})
    //               } else {
    //                 bidIncrementByBidderValue = biddingData.bidIncrementByBidder;
    //               }
    //             } else {
    //               bidIncrementByBidderValue = 0;
    //             }
    //           } else
    //           {
    //             if (biddingData.isAuto == true)
    //             {
    //               if(auctionData.isEditableIncreament == true )
    //               {
    //                 if ( biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder == "" )
    //                 {
    //                   bidIncrementByBidderValue = auctionData.bidIncrementedByOwner
    //                 } else if( biddingData.bidIncrementByBidder < auctionData.bidIncrementedByOwner ) {
    //                   throw new Error ({"errorMessage" : "Auto increment value should be greater thaan"+ auctionData.bidIncrementedByOwner})
    //                 } else {
    //                   bidIncrementByBidderValue = biddingData.bidIncrementByBidder ;
    //                 }
    //               } else
    //               {
    //                 bidIncrementByBidderValue = auctionData.bidIncrementedByOwner;
    //               }
    //             }
    //           }
    //
    //           console.log("first Bid bidderCurrentBid" , bidderCurrentBid);
    //           console.log("first Bid bidIncrementByBidderValue" , bidIncrementByBidderValue);
    //     } else // not first bid
    //     {
    //         previousBidValue = auctionData.winningBid.currentBid ;
    //         if (auctionData.isIncrementSetByOwner == false)
    //         {
    //             if (biddingData.isAuto == true)
    //             {
    //                 if ( biddingData.bidIncrementByBidder == null || biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder <= 0 )
    //                 {
    //                   throw new Error ({"errorMessage": "Bidder's bid increment should be set and greater than 0"})
    //                 } else
    //                 {
    //                   bidIncrementByBidderValue = biddingData.bidIncrementByBidder;
    //                 }
    //
    //                 if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" )
    //                 {
    //                   bidderCurrentBid = auctionData.winningBid.currentBid + biddingData.bidIncrementByBidder ;
    //                 }else if (!(biddingData.placedBidByBidder > auctionData.winningBid.currentBid)) {
    //                   throw new Error ({"errorMessage" : "Your Bid can't be less than current heighest bid" , "errorCode" : "203"})
    //                 }else {
    //                   bidderCurrentBid =  biddingData.placedBidByBidder;
    //                 }
    //
    //             } else
    //             {
    //               if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" || !(biddingData.placedBidByBidder > auctionData.winningBid.currentBid))
    //               {
    //                 throw new Error ({"errorMessage" : "Your Bid can't be less than current heighest bid" , "errorCode" : "203"})
    //               }else {
    //                 bidderCurrentBid =  biddingData.placedBidByBidder;
    //                 bidIncrementByBidderValue = 0;
    //               }
    //             }
    //         } else
    //         {
    //             if (biddingData.isAuto == true) {
    //               if (auctionData.isEditableIncreament == true)
    //               {
    //                 if (biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder == "" )
    //                 {
    //                   bidIncrementByBidderValue = auctionData.bidIncrementByOwner ;
    //                 } else if ( biddingData.bidIncrementByBidder < auctionData.bidIncrementByOwner )
    //                 {
    //                   throw new Error ({errorMessage : "Auto increment value should not be less than"+auctionData.bidIncrementByOwner , errorCode : "203"})
    //                 } else
    //                 {
    //                   bidIncrementByBidderValue = biddingData.bidIncrementByBidder;
    //                 }
    //
    //               } else
    //               {
    //                 bidIncrementByBidderValue = auctionData.bidIncrementByOwner ;
    //               }
    //
    //               // Set placed Bid by bidder as current bidder
    //
    //               if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" )
    //               {
    //                 bidderCurrentBid = auctionData.winningBid.currentBid + biddingData.bidIncrementByBidder ;
    //               }else if (!(biddingData.placedBidByBidder >= (parseFloat(auctionData.winningBid.currentBid)+parseFloat(auctionData.bidIncrementByOwner)))) {
    //                 throw new Error ({"errorMessage" : "Your Bid can't be less than current heighest bid" , "errorCode" : "203"})
    //               }else {
    //                 bidderCurrentBid =  biddingData.placedBidByBidder;
    //               }
    //
    //
    //             } else
    //             {
    //
    //               if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" )
    //               {
    //                 bidderCurrentBid = auctionData.winningBid.currentBid + auctionData.bidIncrementByOwner ;
    //               }else if (!(biddingData.placedBidByBidder >= (parseFloat(auctionData.winningBid.currentBid)+parseFloat(auctionData.bidIncrementByOwner)))) {
    //                 throw new Error ({"errorMessage" : "Your Bid can't be less than current heighest bid i,e "+ parseFloat(auctionData.winningBid.currentBid)+parseFloat(auctionData.bidIncrementByOwner), "errorCode" : "203"})
    //               }else {
    //                 bidderCurrentBid =  biddingData.placedBidByBidder;
    //               }
    //               bidIncrementByBidderValue = 0;
    //
    //             }
    //         }
    //     }
    //
    //     console.log("bidderCurrentBid" , bidderCurrentBid);
    //     console.log("bidIncrementByBidderValue" , bidIncrementByBidderValue);
    //
    //     if (biddingData.upperLimit < bidderCurrentBid || biddingData.upperLimit == ""  || biddingData.upperLimit == "undefined" )
    //     //if (biddingData.isAuto && (biddingData.upperLimit < bidderCurrentBid || biddingData.upperLimit == ""  || biddingData.upperLimit == "undefined") )
    //     {
    //       throw new Error ({"errorMessage": "Upperlimit set by bidder should be greater than " + bidderCurrentBid})
    //     } else
    //     {
    //       if (biddingData.isAuto == true){
    //         remainingBiddingAmountValue = biddingData.upperLimit - bidderCurrentBid ;
    //       }else {
    //         remainingBiddingAmountValue = 0 ;
    //       }
    //       //hook.result = hook.data;
    //     }
    //     hook.result = hook.data;
    //     insertBids(auctionData , biddingData , bidderCurrentBid , remainingBiddingAmountValue , bidIncrementByBidderValue ,previousBidValue)
    // }
    //
    //
    // insertBids = (auctionData , biddingData , bidderCurrentBid , remainingBiddingAmountValue , bidIncrementByBidderValue , previousBidValue) => {
    //     console.log(auctionData);
    //     console.log(biddingData);
    //     console.log(bidderCurrentBid);
    //     console.log(remainingBiddingAmountValue);
    //     console.log(bidIncrementByBidderValue);
    //
    //     r.table("bid_management_all_bids_services").insert({
    //         "auctionId": biddingData.auctionId,
    //         "bidderId": biddingData.bidderId,
    //         "biddingTime": new Date().getTime(),
    //         "currentBid": bidderCurrentBid,
    //         "upperLimit": biddingData.upperLimit,
    //         "remainingBiddingAmount": remainingBiddingAmountValue, // checked isAuto
    //         "bidIncrementByBidder": bidIncrementByBidderValue, //by owner
    //         "previousBid": previousBidValue,
    //         "isAuto": biddingData.isAuto,
    //         "cutOffTime": biddingData.cutOffTime
    //     }).run(connection, function(err, result) {
    //         console.log(err);
    //         console.log(result);
    //     }).then(bidGenerateAtBidsTableResponse => {
    //         //console.log("!!!bidGenerateAtBidsTableResponse!!!", bidGenerateAtBidsTableResponse.generated_keys[0], "///", hookData.result.auctionId);
    //         //r.table().insert()
    //         r.table("bid_management_all_auction_services").filter({
    //             'id':biddingData.auctionId
    //         }).update({
    //             'allBids': r.row('allBids').append(
    //                 bidGenerateAtBidsTableResponse.generated_keys[0]
    //             )
    //         }, {
    //             returnChanges: true
    //         }).run(connection, function(err, cursor) {
    //         }).then(response=> {
    //           console.log(response.changes[0].new_val);
    //           autoBid(response.changes[0].new_val)
    //         })
    //     })
    // }
    //
    // let newBidder;
    // autoBid = (auctionData) => {
    //
    //
    //   //  get Index of latest Bid
    //
    //   var latestBidIndex = auctionData.allBids.length - 1;
    //   var latestBidIdFromAuctionTable = auctionData.allBids[latestBidIndex];
    //   console.log(latestBidIdFromAuctionTable);
    //
    //   // fetch latest data from bids table Start
    //
    //   r.table("bid_management_all_bids_services").get(latestBidIdFromAuctionTable).run(connection,function (err , result) {
    //     if (err) throw err;
    //     //console.log(result);
    //     newBidder = result;
    //     console.log("newBidder result",result);
    //   }).then(function () {
    //     console.log("newBidder",newBidder);
    //     if (latestBidIndex == 0) // for the first bid made
    //     {
    //       if (newBidder.remainingBiddingAmount >= 0)
    //       {
    //
    //         //////////////////////////////////////
    //         //
    //         // check if new bidder is auto bidder
    //         // and if auction is Premium, auto-bidders
    //         // will be bounded by numOfBids
    //         //
    //         //////////////////////////////////////
    //
    //         let numOfAllowedBidsCheck = (newBidder.isAuto == true)&&(auctionData.isPremium == true) ? parseInt(newBidder.numOfAllowedBids) - 1 : 0 ;
    //
    //         console.log(numOfAllowedBidsCheck , "numOfAllowedBidsCheck");
    //
    //         r.table("bid_management_all_auction_services").get(auctionData.id).update({
    //           winningBid:
    //             {
    //               biddingId : newBidder.id ,
    //               bidderId : newBidder.bidderId,
    //               biddingTime : newBidder.biddingTime,
    //               currentBid : newBidder.currentBid,
    //               upperLimit : newBidder.upperLimit,
    //               remainingBiddingAmount : newBidder.remainingBiddingAmount,
    //               bidIncrementByBidder : newBidder.bidIncrementByBidder,
    //               previousBid : newBidder.previousBid,
    //               numOfAllowedBids : numOfAllowedBidsCheck,
    //               isAuto : newBidder.isAuto,
    //               cutOffTime : newBidder.cutOffTime
    //             }
    //         }).run(connection , function (err , result) {
    //             console.log(result);
    //         })
    //       } else
    //       {
    //         console.log("newBidder has in sufficient amount for bidding");
    //       }
    //     }
    //     else
    //     {
    //       //////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    //       //
    //       // ## when the new user is not the
    //       // ## first bidder, he/she will be
    //       // ## bidding against current winningBid
    //       //
    //       //////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    //       let notifyerOncutoffTime = false;
    //
    //       if ((newBidder.remainingBiddingAmount >= 0) || (newBidder.isAuto != true))
    //       {
    //
    //         //////////////////////////////////////////////
    //         //
    //         // checking if new bidder's remainingBidAmount
    //         // is enough that he/she can bid incase the
    //         // new bidder is an auto bidder. this if
    //         // won't be required if remainingBiddingAmount
    //         // constraint is checked before insertion
    //         //
    //         //////////////////////////////////////////////
    //         let min1 ;
    //         let bidsPossible1;
    //
    //
    //         ////////////////////////////////////////////
    //         //
    //         // the following if/else is to calculate
    //         // minimum number of times the current
    //         // highest bidding user will be able to bid
    //         //
    //         ////////////////////////////////////////////
    //
    //         console.log(" auctionData.winningBid.cutOffTime ", auctionData.winningBid.cutOffTime);
    //
    //         console.log("  new Date().getTime() ",  new Date().getTime());
    //
    //         if (auctionData.winningBid.isAuto == true && auctionData.winningBid.cutOffTime >= new Date().getTime())
    //         {
    //            let  bidsPossible1 = Math.floor(auctionData.winningBid.remainingBiddingAmount / (auctionData.winningBid.bidIncrementByBidder + newBidder.bidIncrementByBidder));
    //             if (auctionData.isPremium){
    //                 min1 = auctionData.winningBid.numOfAllowedBids > bidsPossible1 ? bidsPossible1 : auctionData.winningBid.numOfAllowedBids;
    //                 console.log("min1" , min1 ,"bidsPossible1" , bidsPossible1);
    //             }else{
    //                 min1 = bidsPossible1;
    //                 console.log("min1..." , min1 ,"bidsPossible1///" , bidsPossible1);
    //             }
    //         } else
    //         {
    //             min1 = 0;
    //             if(auctionData.winningBid.cutOffTime < new Date().getTime())
    //             {
    //                notifyerOncutoffTime = true
    //             }
    //             console.log("min1" , min1) ;
    //
    //
    //         }
    //
    //
    //         let bidsPossible2;
    //         let min2;
    //
    //         //////////////////////////////////////
    //         //
    //         // the follownig if/else is to calculate
    //         // minimum number of times the new
    //         // bidding user will be able to bid
    //         //
    //         //////////////////////////////////////
    //
    //         if (newBidder.isAuto == true)
    //         {
    //             // bidsPossible2 = Math.floor(parseInt(newBidder.remainingBidAmount) / (parseInt(auctionData.winningBid.bidIncrementByBidder) + parseInt(newBidder.bidIncrementByBidder))) + 1;
    //
    //             console.log("newBidder.remainingBidAmount",newBidder.remainingBidAmount);
    //             console.log("auctionData.winningBid.bidIncrementByBidder" , auctionData.winningBid.bidIncrementByBidder);
    //             console.log("newBidder.bidIncrementByBidder",newBidder.bidIncrementByBidder);
    //
    //
    //             bidsPossible2 =  auctionData.winningBid.bidIncrementByBidder + newBidder.bidIncrementByBidder;
    //
    //             console.log("bidnewBidder" , newBidder);
    //             console.log("bidauctionData" , auctionData);
    //
    //             console.log("bidsPossible2" ,bidsPossible2);
    //             if(auctionData.isPremium)
    //             {
    //                 min2 =newBidder.numOfAllowedBids > bidsPossible2 ? bidsPossible2 :newBidder.numOfAllowedBids;
    //             }else
    //             {
    //                 min2 = bidsPossible2;
    //             }
    //
    //         } else
    //         {
    //             min2 = 1;
    //         }
    //
    //
    //
    //         //////////////////////////////////////////
    //         //
    //         // storing the biddingId of the winner
    //         // between the previous winning bid and
    //         // the new bid
    //         //
    //         //////////////////////////////////////////
    //         console.log(" min1 ",min1," min2 ",min2);
    //         console.log("newBidder.biddingId", newBidder);
    //
    //         let roundWinningBidId = min1 < min2 ? newBidder.id : auctionData.winningBid.biddingId;
    //         let minLoop = min1 < min2 ? min1 : min2;
    //
    //         console.log("roundWinningBidId",roundWinningBidId);
    //         console.log("minLoop",minLoop);
    //
    //         if ( roundWinningBidId == auctionData.winningBid.biddingId )
    //         {
    //
    //           let currentIncrement = ((parseInt(auctionData.winningBid.bidIncrementByBidder) + parseInt(newBidder.bidIncrementByBidder)) * (min2 - 1)) + parseInt(auctionData.winningBid.bidIncrementByBidder) + parseInt(newBidder.currentBid) - parseInt(auctionData.winningBid.currentBid);
    //
    //           let amountRemainingAfterBid ;
    //           let numOfAllowedBidsAfterBid ;
    //
    //
    //
    //           if (auctionData.isPremium == "true")
    //           {
    //             amountRemainingAfterBid = parseInt(auctionData.winningBid.remainingBiddingAmount) - (parseInt(currentIncrement));
    //
    //             numOfAllowedBidsAfterBid = parseInt(auctionData.winningBid.numOfAllowedBids) - (parseInt(minLoop) + 1)
    //           } else
    //           {
    //             //amountRemainingAfterBid = newBidder.remainingBiddingAmount;
    //
    //             amountRemainingAfterBid = parseInt(auctionData.winningBid.remainingBiddingAmount) - (parseInt(currentIncrement));
    //
    //             numOfAllowedBidsAfterBid = 0;
    //           }
    //
    //           console.log("###amountRemainingAfterBid",amountRemainingAfterBid);
    //
    //           r.table("bid_management_all_auction_services").get(auctionData.id).update({
    //             winningBid:
    //               {
    //                 biddingId : auctionData.winningBid.biddingId ,
    //                 bidderId : auctionData.winningBid.bidderId,
    //                 biddingTime : auctionData.winningBid.biddingTime,
    //                 currentBid : parseInt(auctionData.winningBid.currentBid) + parseInt(currentIncrement) ,
    //                 upperLimit : auctionData.winningBid.upperLimit,
    //                 remainingBiddingAmount : amountRemainingAfterBid,
    //                 bidIncrementByBidder : auctionData.winningBid.bidIncrementByBidder,
    //                 previousBid : parseInt(auctionData.winningBid.currentBid) + parseInt(currentIncrement) - parseInt(auctionData.winningBid.bidIncrementByBidder),
    //                 numOfAllowedBids : numOfAllowedBidsAfterBid ,  // checked
    //                 isAuto : auctionData.winningBid.isAuto,
    //                 cutOffTime : auctionData.winningBid.cutOffTime
    //               }
    //           }).run(connection , function (err , result) {
    //               console.log(result);
    //           }).then(function(){
    //             if (notifyerOncutoffTime == true) {
    //               // send and notify email about timeout
    //             }
    //           })
    //
    //         } else
    //         {
    //           console.log(auctionData.winningBid.bidIncrementByBidder);
    //           console.log(newBidder.bidIncrementByBidder);
    //           let currentIncrement = ((parseInt(auctionData.winningBid.bidIncrementByBidder) + parseInt(newBidder.bidIncrementByBidder)) * min1);
    //
    //           console.log("else currentIncrement" , currentIncrement);
    //           console.log("else minLoop",minLoop);
    //           if (auctionData.winningBid.isAuto != true)
    //           {
    //               minLoop++;
    //           }
    //
    //           let currentBidByNewUser = parseInt(newBidder.currentBid) + currentIncrement;
    //
    //
    //
    //           let lastIncrement = (min1 == 0)? newBidder.currentBid - auctionData.winningBid.currentBid : auctionData.winningBid.bidIncrementByBidder;
    //
    //           console.log("lastIncrement",lastIncrement);
    //
    //           newBidder.previousBid = currentBidByNewUser - lastIncrement;
    //
    //           console.log("newBidder.previousBid",newBidder.previousBid);
    //
    //           //let amountRemaining = newBidder.upperLimit - currentBidByNewUser;
    //
    //           //console.log(newBidder.upperLimit , "  /  ",amountRemaining);
    //
    //
    //           let finalNumOfAllowedBids = (newBidder.isAuto == true && auctionData.isPremium == true) ? newBidder.numOfAllowedBids - minLoop : 0 ;
    //
    //           let finalRemainingBidAmount = (newBidder.isAuto == true) ? newBidder.upperLimit - currentBidByNewUser : 0 ;
    //
    //             console.log(auctionData.id);
    //             console.log("numOfAllowedBids" , finalNumOfAllowedBids);
    //             r.table("bid_management_all_auction_services").get(auctionData.id).update({
    //               winningBid:
    //                 {
    //                   biddingId : newBidder.id ,
    //                   bidderId : newBidder.bidderId,
    //                   biddingTime : newBidder.biddingTime,
    //                   currentBid : currentBidByNewUser,
    //                   upperLimit : newBidder.upperLimit,
    //                   remainingBiddingAmount : finalRemainingBidAmount,
    //                   bidIncrementByBidder : newBidder.bidIncrementByBidder,
    //                   previousBid : currentBidByNewUser - lastIncrement,
    //                   numOfAllowedBids : finalNumOfAllowedBids,  // checked
    //                   isAuto : newBidder.isAuto,
    //                   cutOffTime : newBidder.cutOffTime
    //                 }
    //             }).run(connection , function (err , result) {
    //                 console.log(result);
    //             }).then(function(){
    //               if (notifyerOncutoffTime == true) {
    //                 // send and notify email about timeout
    //               }
    //             })
    //         }
    //       }
    //     }
    //   })
    //
    //
    // };
    //
    // // Update auction table after a bid is placed
    var errorMessage;
    function errorHooks(hook ) {
      console.log('modelData', errorMessage);
      console.log("error aaya re baba" , hook.data.error);
      console.log("error khatam huaaaaya re baba");
      hook.error = {"errorCode" : 203 , "errorMessage" : errorMessage}

    }

    async function beforePlaceBid(hook) {
            //

            hook.result = hook.data;
            biddingData = hook.data;
            await r.table("bid_management_all_auction_services").get(hook.data.auctionId).run(connection, function(err, result) {
              auctionData = result;
            })

            console.log("biddingData ",biddingData);
            console.log("auctionData" ,auctionData);


            if ( auctionData.allBids.length == 0 ) //  first bid
            {

                  //////////////////////////////////////////////
                  //                                          //
                  // if bidder has not set bidder.currentBid, //
                  // Set currentBid as auction's base price   //
                  //                                          //
                  //////////////////////////////////////////////

                  if (auctionData.basePrice > biddingData.placedBidByBidder)
                  {
                  //  hook.error = {"errorMessage" : "" , "errorCode" : 203};
                    errorMessage = "Your Bid should be more than product's starting Bid";
                    throw new Error ({"errorMessage" : errorMessage});

                  } else if( biddingData.placedBidByBidder == "" || biddingData.placedBidByBidder == "undefined" )
                  {
                    bidderCurrentBid =  auctionData.basePrice;
                  } else
                  {
                    bidderCurrentBid =  biddingData.placedBidByBidder;
                  }

                  previousBidValue = 0;

                  if (auctionData.isIncrementSetByOwner == "false")
                  {
                    if (biddingData.isAuto == true) // owner did not set increament and bidder is auto bidder
                    {
                      if ( biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder <= 0 )
                      {
                        errorMessage = "Bidders bid increment should be set and greater than 0";
                        throw new Error ({"errorMessage": errorMessage})
                      } else
                      {
                        bidIncrementByBidderValue = biddingData.bidIncrementByBidder;

                      }
                    } else
                    {
                      console.log("auctionData.isIncrementSetByOwner 633" , auctionData.isIncrementSetByOwner);
                      bidIncrementByBidderValue = 0;
                    }
                  } else
                  {
                    if (biddingData.isAuto == true)
                    {
                      if(auctionData.isEditableIncreament == "true" )
                      {
                        if ( parseFloat(biddingData.bidIncrementByBidder) == "undefined" || parseFloat(biddingData.bidIncrementByBidder == "" ))
                        {
                          bidIncrementByBidderValue = auctionData.bidIncrementByOwner;
                          console.log("bidIncrementByBidderValue line 643 " , bidIncrementByBidderValue);
                        } else if( biddingData.bidIncrementByBidder < auctionData.bidIncrementByOwner ) {
                          errorMessage = "Auto increment value should be greater thaan"+ auctionData.bidIncrementByOwner;
                          throw new Error ({"errorMessage" : errorMessage})
                        } else {
                          bidIncrementByBidderValue = biddingData.bidIncrementByBidder ;
                        }
                      } else
                      {

                        bidIncrementByBidderValue = auctionData.bidIncrementByOwner;
                        console.log("bidIncrementByBidderValue line 653" , bidIncrementByBidderValue);
                      }
                    }else
                    {
                      console.log("biddingData.isAuto 659" , biddingData.isAuto);
                      bidIncrementByBidderValue = 0;
                    }
                  }

                  console.log("first Bid bidderCurrentBid" , bidderCurrentBid);
                  console.log("first Bid bidIncrementByBidderValue" , bidIncrementByBidderValue);
            } else // not first bid
            {
                previousBidValue = auctionData.winningBid.currentBid ;
                if (auctionData.isIncrementSetByOwner == "false")
                {
                    if (biddingData.isAuto == true)
                    {
                        if ( biddingData.bidIncrementByBidder == null || biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder <= 0 )
                        {
                          errorMessage = "your bid increment value should be set and greater than 0";
                          throw new Error ({"errorMessage": errorMessage});

                        } else
                        {
                          bidIncrementByBidderValue = biddingData.bidIncrementByBidder;
                        }

                        if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" )
                        {
                          bidderCurrentBid = parseFloat(auctionData.winningBid.currentBid) + parseFloat(biddingData.bidIncrementByBidder) ;
                        }else if (!(biddingData.placedBidByBidder > parseFloat(auctionData.winningBid.currentBid))) {
                          errorMessage = "Your Bid should be more than current heighest bid";
                          throw new Error ({"errorMessage" : errorMessage})
                        }else {
                          bidderCurrentBid =  biddingData.placedBidByBidder;
                        }

                    } else
                    {
                      if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" || !(biddingData.placedBidByBidder > parseFloat(auctionData.winningBid.currentBid)))
                      {
                        errorMessage = "Your Bid can't be less than current heighest bid";
                        throw new Error ({"errorMessage" : errorMessage})
                      }else {
                        bidderCurrentBid =  biddingData.placedBidByBidder;
                        bidIncrementByBidderValue = bidderCurrentBid - parseFloat(auctionData.winningBid.currentBid);
                      }
                    }
                } else
                {
                    if (biddingData.isAuto == true)
                    {
                      if (auctionData.isEditableIncreament == "true")
                      {
                        if (biddingData.bidIncrementByBidder == "undefined" || biddingData.bidIncrementByBidder == "" )
                        {
                          bidIncrementByBidderValue = parseFloat(auctionData.bidIncrementByOwner) ;
                          console.log('709');
                        } else if ( biddingData.bidIncrementByBidder < parseFloat(auctionData.bidIncrementByOwner) )
                        {
                          errorMessage ="Auto increment value should not be less than"+auctionData.bidIncrementByOwner;
                          throw new Error ({errorMessage : errorMessage});//
                            //hook.result = {errorMessage : "Auto increment value should not be less than"+auctionData.bidIncrementByOwner , errorCode : "203"}
                        } else
                        {
                          bidIncrementByBidderValue = biddingData.bidIncrementByBidder;
                        }

                      } else
                      {
                        bidIncrementByBidderValue = parseFloat(auctionData.bidIncrementByOwner) ;
                        console.log('721');
                      }

                      // Set placed Bid by bidder as current bidder

                      if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" )
                      {
                        bidderCurrentBid = parseFloat(auctionData.winningBid.currentBid) + biddingData.bidIncrementByBidder ;
                      }else if (!(biddingData.placedBidByBidder >= (parseFloat(auctionData.winningBid.currentBid)+parseFloat(auctionData.bidIncrementByOwner)))) {
                        errorMessage ="Your Bid can't be less than current heighest bid" , "errorCode" ;
                        throw new Error ({"errorMessage" : errorMessage})
                      }else {
                        bidderCurrentBid =  biddingData.placedBidByBidder;
                      }


                    } else
                    {

                      if (biddingData.placedBidByBidder == "undefined" || biddingData.placedBidByBidder == "" )
                      {
                        bidderCurrentBid = auctionData.winningBid.currentBid + parseFloat(auctionData.bidIncrementByOwner) ;
                      }else if (!(biddingData.placedBidByBidder >= (parseFloat(auctionData.winningBid.currentBid)+parseFloat(auctionData.bidIncrementByOwner)))) {
                        errorMessage ="Your Bid can't be less than current heighest bid i,e "+ (parseFloat(auctionData.winningBid.currentBid)+parseFloat(auctionData.bidIncrementByOwner)) ;
                        throw new Error ({"errorMessage" : errorMessage})
                      }else
                      {
                        bidderCurrentBid =  biddingData.placedBidByBidder;
                      }
                      bidIncrementByBidderValue = bidderCurrentBid - parseFloat(auctionData.winningBid.currentBid);

                    }
                }
            }

            console.log("bidderCurrentBid" , bidderCurrentBid);
            console.log("bidIncrementByBidderValue" , bidIncrementByBidderValue);


            if ((biddingData.isAuto == true) && ( biddingData.upperLimit < bidderCurrentBid || biddingData.upperLimit == ""  || biddingData.upperLimit == "undefined" ))
            {
              errorMessage ="Upperlimit set by bidder should be greater than "+bidderCurrentBid;
              throw new Error ({"errorMessage": errorMessage})
            } else
            {
              if (biddingData.isAuto == true){
                remainingBiddingAmountValue = biddingData.upperLimit - bidderCurrentBid ;
                bidderUpperlimit = biddingData.upperLimit;
              }else {
                remainingBiddingAmountValue = 0 ;
                bidderUpperlimit = 0;
              }
              //hook.result = hook.data;
            }
            //hook.result = hook.data;
            insertBids(auctionData , biddingData , bidderUpperlimit , bidderCurrentBid , remainingBiddingAmountValue , bidIncrementByBidderValue ,previousBidValue)
        }


        insertBids = (auctionData , biddingData , bidderUpperlimit , bidderCurrentBid , remainingBiddingAmountValue , bidIncrementByBidderValue , previousBidValue) => {
            console.log(auctionData);
            console.log(biddingData);
            console.log(bidderCurrentBid);
            console.log(remainingBiddingAmountValue);
            console.log(bidIncrementByBidderValue);

            r.table("bid_management_all_bids_services").insert({
                "auctionId": biddingData.auctionId,
                "bidderId": biddingData.bidderId,
                "biddingTime": new Date().getTime(),
                "currentBid": bidderCurrentBid,
                "upperLimit": bidderUpperlimit,
                "remainingBiddingAmount": remainingBiddingAmountValue, // checked isAuto
                "bidIncrementByBidder": bidIncrementByBidderValue, //by owner
                "previousBid": previousBidValue,
                "isAuto": biddingData.isAuto,
                "cutOffTime": biddingData.cutOffTime
            }).run(connection, function(err, result) {
                console.log(err);
                console.log(result);
            }).then(bidGenerateAtBidsTableResponse => {
                //console.log("!!!bidGenerateAtBidsTableResponse!!!", bidGenerateAtBidsTableResponse.generated_keys[0], "///", hookData.result.auctionId);
                //r.table().insert()
                r.table("bid_management_all_auction_services").filter({
                    'id':biddingData.auctionId
                }).update({
                    'allBids': r.row('allBids').append(
                        bidGenerateAtBidsTableResponse.generated_keys[0]
                    )
                }, {
                    returnChanges: true
                }).run(connection, function(err, cursor) {
                }).then(response=> {
                  console.log(response.changes[0].new_val);
                  autoBid(response.changes[0].new_val)
                })
            })
        }









    let newBidder;
        autoBid = (auctionData) => {


          //  get Index of latest Bid

          var latestBidIndex = auctionData.allBids.length - 1;
          var latestBidIdFromAuctionTable = auctionData.allBids[latestBidIndex];
          console.log(latestBidIdFromAuctionTable);

          // fetch latest data from bids table Start

          r.table("bid_management_all_bids_services").get(latestBidIdFromAuctionTable).run(connection,function (err , result) {
            if (err) throw err;
            //console.log(result);
            newBidder = result;
            console.log("newBidder result",result);
          }).then(function () {
            console.log("newBidder",newBidder);
            if (latestBidIndex == 0) // for the first bid made
            {
              if (newBidder.remainingBiddingAmount >= 0)
              {

                //////////////////////////////////////
                //
                // check if new bidder is auto bidder
                // and if auction is Premium, auto-bidders
                // will be bounded by numOfBids
                //
                //////////////////////////////////////

                let numOfAllowedBidsCheck = (newBidder.isAuto == true)&&(auctionData.isPremium == true) ? parseFloat(newBidder.numOfAllowedBids) - 1 : 0 ;

                console.log(numOfAllowedBidsCheck , "numOfAllowedBidsCheck");

                r.table("bid_management_all_auction_services").get(auctionData.id).update({
                  winningBid:
                    {
                      biddingId : newBidder.id ,
                      bidderId : newBidder.bidderId,
                      biddingTime : newBidder.biddingTime,
                      currentBid : Math.round(newBidder.currentBid * 100)/100,
                      upperLimit : newBidder.upperLimit,
                      remainingBiddingAmount : newBidder.remainingBiddingAmount,
                      bidIncrementByBidder : newBidder.bidIncrementByBidder,
                      previousBid : Math.round(newBidder.previousBid * 100)/100,
                      numOfAllowedBids : numOfAllowedBidsCheck,
                      isAuto : newBidder.isAuto,
                      cutOffTime : newBidder.cutOffTime
                    }
                }).run(connection , function (err , result) {
                    console.log(result);
                })
              } else
              {
                console.log("newBidder has in sufficient amount for bidding");
              }
            }
            else
            {
              //////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\
              //
              // ## when the new user is not the
              // ## first bidder, he/she will be
              // ## bidding against current winningBid
              //
              //////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
              let notifyerOncutoffTime = false;

              if ((newBidder.remainingBiddingAmount >= 0) || (newBidder.isAuto != true))
              {

                //////////////////////////////////////////////
                //
                // checking if new bidder's remainingBidAmount
                // is enough that he/she can bid incase the
                // new bidder is an auto bidder. this if
                // won't be required if remainingBiddingAmount
                // constraint is checked before insertion
                //
                //////////////////////////////////////////////
                let min1 ;
                let bidsPossible1;


                ////////////////////////////////////////////
                //
                // the following if/else is to calculate
                // minimum number of times the current
                // highest bidding user will be able to bid
                //
                ////////////////////////////////////////////

                console.log(" auctionData.winningBid.cutOffTime ", auctionData.winningBid.cutOffTime);

                console.log("  new Date().getTime() ",  new Date().getTime());

                if (auctionData.winningBid.isAuto == true && auctionData.winningBid.cutOffTime >= new Date().getTime())
                {
                   let  bidsPossible1 = Math.floor(parseFloat(auctionData.winningBid.remainingBiddingAmount) / (parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.bidIncrementByBidder)));

                   console.log("parseFloat(auctionData.winningBid.remainingBiddingAmount)" , parseFloat(auctionData.winningBid.remainingBiddingAmount));

                   console.log("parseFloat(auctionData.winningBid.bidIncrementByBidder)" , parseFloat(auctionData.winningBid.bidIncrementByBidder));

                   console.log("parseFloat(newBidder.bidIncrementByBidder)" , parseFloat(newBidder.bidIncrementByBidder));

                   console.log( "Final bidsPossible1" , Math.floor(parseFloat(auctionData.winningBid.remainingBiddingAmount) / (parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.bidIncrementByBidder))));

                    if (auctionData.isPremium == true){
                        min1 = auctionData.winningBid.numOfAllowedBids > bidsPossible1 ? bidsPossible1 : auctionData.winningBid.numOfAllowedBids;
                        console.log("min1" , min1 ,"bidsPossible1" , bidsPossible1);
                    }else{
                        min1 = bidsPossible1;
                        console.log("min1..." , min1 ,"bidsPossible1///" , bidsPossible1);
                    }
                } else
                {
                    min1 = 0;
                    if(auctionData.winningBid.cutOffTime < new Date().getTime())
                    {
                       notifyerOncutoffTime = true
                    }
                    console.log("min1" , min1) ;


                }


                let bidsPossible2;
                let min2;

                //////////////////////////////////////
                //
                // the follownig if/else is to calculate
                // minimum number of times the new
                // bidding user will be able to bid
                //
                //////////////////////////////////////


                // bidsPossible2 = Math.floor(parseFloat(newBidder.remainingBidAmount) / (parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.bidIncrementByBidder))) + 1;
                // change again by bhumil

                if (newBidder.isAuto == true) {
                    bidsPossible2 = Math.floor(parseFloat(newBidder.remainingBiddingAmount) / (parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.bidIncrementByBidder))) + 1;
                    if(auctionData.isPremium == true){
                        min2 = newBidder.numOfAllowedBids > bidsPossible2 ? bidsPossible2 : newBidder.numOfAllowedBids;
                    }else{
                        min2 = bidsPossible2;
                    }
                    console.log("newBidder.remainingBidAmount",newBidder.remainingBiddingAmount);
                    console.log("auctionData.winningBid.bidIncrementByBidder" , auctionData.winningBid.bidIncrementByBidder);
                    console.log("newBidder.bidIncrementByBidder",newBidder.bidIncrementByBidder);
                } else {
                    min2 = 1;
                }

                console.log("bidnewBidder" , newBidder);
                console.log("bidauctionData" , auctionData);

                console.log("bidsPossible2" ,bidsPossible2);

                //////////////////////////////////////////
                //
                // storing the biddingId of the winner
                // between the previous winning bid and
                // the new bid
                //
                //////////////////////////////////////////
                console.log(" min1 ",min1," min2 ",min2);
                console.log("newBidder.biddingId", newBidder);

                let roundWinningBidId = min1 < min2 ? newBidder.id : auctionData.winningBid.biddingId;
                let minLoop = min1 < min2 ? min1 : min2;

                console.log("roundWinningBidId",roundWinningBidId);
                console.log("minLoop",minLoop);

                if ( roundWinningBidId == auctionData.winningBid.biddingId )
                {

                  let currentIncrement = ((parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.bidIncrementByBidder)) * (min2 - 1)) + parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.currentBid) - parseFloat(auctionData.winningBid.currentBid);

                  let amountRemainingAfterBid ;
                  let numOfAllowedBidsAfterBid ;



                  if (auctionData.isPremium == "true")
                  {
                    amountRemainingAfterBid = parseFloat(auctionData.winningBid.remainingBiddingAmount) - (parseFloat(currentIncrement));

                    numOfAllowedBidsAfterBid = parseFloat(auctionData.winningBid.numOfAllowedBids) - (parseFloat(minLoop) + 1)
                  } else
                  {
                    //amountRemainingAfterBid = newBidder.remainingBiddingAmount;

                    amountRemainingAfterBid = parseFloat(auctionData.winningBid.remainingBiddingAmount) - (parseFloat(currentIncrement));

                    numOfAllowedBidsAfterBid = 0;
                  }

                  console.log("###amountRemainingAfterBid",amountRemainingAfterBid);

                  r.table("bid_management_all_auction_services").get(auctionData.id).update({
                    winningBid:
                      {
                        biddingId : auctionData.winningBid.biddingId ,
                        bidderId : auctionData.winningBid.bidderId,
                        biddingTime : auctionData.winningBid.biddingTime,
                        currentBid : Math.round((parseFloat(auctionData.winningBid.currentBid) + parseFloat(currentIncrement))*100)/100,
                        upperLimit : auctionData.winningBid.upperLimit,
                        remainingBiddingAmount : amountRemainingAfterBid,
                        bidIncrementByBidder : auctionData.winningBid.bidIncrementByBidder,
                        previousBid : Math.round((parseFloat(auctionData.winningBid.currentBid) + parseFloat(currentIncrement) - parseFloat(auctionData.winningBid.bidIncrementByBidder))*100)/100,
                        numOfAllowedBids : numOfAllowedBidsAfterBid ,  // checked
                        isAuto : auctionData.winningBid.isAuto,
                        cutOffTime : auctionData.winningBid.cutOffTime
                      }
                  }).run(connection , function (err , result) {
                      console.log(result);
                  }).then(function(){
                    if (notifyerOncutoffTime == true) {
                      // send and notify email about timeout
                    }
                  })

                } else
                {
                  console.log(auctionData.winningBid.bidIncrementByBidder);
                  console.log(newBidder.bidIncrementByBidder);
                  let currentIncrement = ((parseFloat(auctionData.winningBid.bidIncrementByBidder) + parseFloat(newBidder.bidIncrementByBidder)) * min1);

                  console.log("else currentIncrement" , currentIncrement);
                  console.log("else minLoop",minLoop);
                  if (auctionData.winningBid.isAuto != true)
                  {
                      minLoop++;
                  }

                  let currentBidByNewUser = parseFloat(newBidder.currentBid) + currentIncrement;



                  let lastIncrement = (min1 == 0)? newBidder.currentBid - auctionData.winningBid.currentBid : auctionData.winningBid.bidIncrementByBidder;

                  console.log("lastIncrement",lastIncrement);

                  newBidder.previousBid = currentBidByNewUser - lastIncrement;

                  console.log("newBidder.previousBid",newBidder.previousBid);

                  //let amountRemaining = newBidder.upperLimit - currentBidByNewUser;

                  //console.log(newBidder.upperLimit , "  /  ",amountRemaining);


                  let finalNumOfAllowedBids = (newBidder.isAuto == true && auctionData.isPremium == true) ? newBidder.numOfAllowedBids - minLoop : 0 ;

                  let finalRemainingBidAmount = (newBidder.isAuto == true) ? newBidder.upperLimit - currentBidByNewUser : 0 ;

                    console.log(auctionData.id);
                    console.log("numOfAllowedBids" , finalNumOfAllowedBids);
                    r.table("bid_management_all_auction_services").get(auctionData.id).update({
                      winningBid:
                        {
                          biddingId : newBidder.id ,
                          bidderId : newBidder.bidderId,
                          biddingTime : newBidder.biddingTime,
                          currentBid : Math.round(currentBidByNewUser * 100) / 100,
                          upperLimit : newBidder.upperLimit,
                          remainingBiddingAmount : finalRemainingBidAmount,
                          bidIncrementByBidder : newBidder.bidIncrementByBidder,
                          previousBid : Math.round((currentBidByNewUser - lastIncrement)*100)/100,
                          numOfAllowedBids : finalNumOfAllowedBids,  // checked
                          isAuto : newBidder.isAuto,
                          cutOffTime : newBidder.cutOffTime
                        }
                    }).run(connection , function (err , result) {
                        console.log(result);
                    }).then(function(){
                      if (notifyerOncutoffTime == true) {
                        // send and notify email about timeout
                      }
                    })
                }
              }
            }
          })


        };



    service.hooks({
        before: {
            all: [],
            find: [],
            get: [],
            create: [
                hook => beforePlaceBid(hook),
            ],
            update: [],
            patch: [],
            remove: []
        },
        after: {
            all: [],
            find: [],
            get: [],
            create: [

              //  hook => afterPlaceBid(hook)
            ],
            update: [],
            patch: [],
            remove: []
        },
        error: {
            all: [
              hook => errorHooks(hook)            ],
            find: [],
            get: [],
            create: [],
            update: [],
            patch: [],
            remove: []
        }
    })

    //service.hooks(hooks);

    if (service.filter) {
        service.filter(filters);
    }
};
