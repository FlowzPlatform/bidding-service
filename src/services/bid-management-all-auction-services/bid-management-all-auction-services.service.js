// Initializes the `bidManagementAllAuctionServices` service on path `/auctions`
const createService = require('feathers-rethinkdb');
const hooks = require('./bid-management-all-auction-services.hooks');
const filters = require('./bid-management-all-auction-services.filters');
const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const feathers = require('feathers');
const r = require('rethinkdb');
const config = require('config');
const path = require('path');
const fs = require('fs');

let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null
let rauth = process.env.rauth ? process.env.rauth : null
const swagger = require('feathers-swagger');
const rest = require('feathers-rest');

module.exports = function() {

    const app = this;
    const Model = app.get('rethinkdbClient');
    const paginate = app.get('paginate');

    const options = {
        name: 'bid_management_all_auction_services',
        Model,
        paginate
    };

    let connection;

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
    console.log("==before==");
    // Initialize our service with any options it requires
    app.use('/auctions', createService(options));
    console.log("==after==");
    // Get our initialized service so that we can register hooks and filters
    const service = app.service('auctions');

    let singleEntryInJobQueue;
    createNewAuctionHook = (hookData) => {
        singleEntryInJobQueue = true;
        hookData.data.allBids = [];
        hookData.data.createdAt = new Date().getTime();

        hookData.data.winningBid = {};
        console.log("before Hook", hookData.result);
    }

    afterCreateJobQueue = (hook) => {
        console.log("after Hook", hook.result.id);
        r.table("AuctionQueue").filter({
        "auctionId": hook.result.id
        }).run(connection, function(err, result) {
          console.log("result" ,result);
        })

        if (singleEntryInJobQueue == true) {
            console.log("after Hook", singleEntryInJobQueue);
            singleEntryInJobQueue = false
            r.table("AuctionQueue").insert({
                "auctionId": hook.result.id,
                "dateEnable": hook.result.endBidDate
            }).run(connection, function(err, result) {
                console.log(err);
                console.log(result);
            }).then(response => {
                singleEntryInJobQueue = false
            })
        }
    }

    app.configure(rest())
        .configure(swagger({
            docsPath: '/docs',
            prefix: /api\/v\d\//,
            versionPrefix: /v\d/,
            uiIndex: true,
            info: {
                title: 'Bid Management API',
                description: 'Test all the apis with swagger'
            }
        }))
        .use('/auctions', service);



    service.hooks({
        before: {
            all: [],
            find: [],
            get: [],
            create: [
                hook => createNewAuctionHook(hook),
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
                hook => afterCreateJobQueue(hook),
            ],
            update: [],
            patch: [],
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
    })

    //service.hooks(hooks);

    if (service.filter) {
        service.filter(filters);
    }
};
