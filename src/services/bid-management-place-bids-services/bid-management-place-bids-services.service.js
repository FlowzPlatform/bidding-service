const auth = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const feathers = require('feathers');
const path = require('path');

const hooks = require('feathers-hooks');
const errors = require('feathers-errors');

const swagger = require('feathers-swagger');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const r = require('rethinkdb');
const config = require('config');
let  connection ;
const fs = require('fs');

let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null
let rauth = process.env.rauth ? process.env.rauth : null

module.exports = function() {
  const app = this;

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

  var getBidsService = {
    find: function(params) {
      return Promise.resolve([
        {
          id: 1,
          text: 'Message 1'
        }, {
          id: 2,
          text: 'Message 2'
        }
      ]);
    },
    get: function(id, params) {
      return Promise.resolve([
        {
          id: 1,
          text: 'Message 1'
        }, {
          id: 2,
          text: 'Message 2'
        }
      ]);
    },
    create: function(data, params) {
      console.log(data);

    //  this.messages.push(data);
      return Promise.resolve(data);
    },
    update: function(id, data, params) {},
    patch: function(id, data, params) {},
    remove: function(id, params) {},
    setup: function(app, path) {},
  }

  // Use it in your application at the `/todos` endpoint
  //app.use('/getBidsService', getBidsService);
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
      .use('/getBids', getBidsService);


    //  beforeGetBids = (hook) => {
      async function beforeGetBids(hook) {


        console.log('beforehook' , hook.data);
        await r.table("bid_management_all_bids_services").filter({"auctionId" : hook.data.id}).run(connection , function (err, cursor) {

          var resultsArray = [];
          cursor.each(function(err, row) {
          if (err) throw err;
        //  console.log(row);
          const isInArray = resultsArray.includes(row);
          if (isInArray == false)
          {
              resultsArray.push(row);
          }

          console.log("resultsArray ",resultsArray);
          hook.result = resultsArray;
        })
      })

        //  if (hook.data.new == "bad")
        //  {
        //   // hook.result = {"errorCode" : 203 , "errorMessage" : " value of new is bad"}
        //    throw require('feathers-errors').BadRequest('General err msg', { errors: { "errorMessage": 'Specific err msg' } } )
        //  } else
        //  {
        //    hook.result = hook.data;
        //  }

      }


      // afterGetBids = (hook , next) => {
      //   //hook.result.data = hook.data;
      //   console.log("after hook",hook);
      // }

      errorGetBids = (hook) => {

        console.log('errorGetBids' , hook.data);
      }

      app.service("getBids").hooks({
          before: {
              all: [],
              find: [],
              get: [

              ],
              create: [
                hook => beforeGetBids(hook),
              ],
              update: [],
              patch: [],
              remove: []
          },
          after: {
              all: [],
              find: [],
              get: [

              ],
              create: [
                //hook => afterGetBids(hook),
              ],
              update: [],
              patch: [],
              remove: []
          },
          error: {
              all: [
                hook => errorGetBids(hook)
              ],
              find: [],
              get: [],
              create: [],
              update: [],
              patch: [],
              remove: []
          }
      })

}
