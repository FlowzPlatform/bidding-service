/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const fs = require('fs');
let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null
let rauth = process.env.rauth ? process.env.rauth : null
process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);

console.log('===================================================')
console.log('************ Starting Timer Function **************')
console.log('===================================================')
const r = require('rethinkdb')
const config = require('config')
let connection;

function fetchNewData(){
  r.connect({
    host: config.get('rdb_host'),
    port: config.get('rdb_port'),
    authKey: rauth,
    ssl: ssl,
    db: config.get('rdb_db')
  }, function(err, conn) {
      if (err) throw err;
      console.log('\n..... ATTEMPTING TO FETCH NEW AUCTIONS UPDATED/CREATED .....')
      r.table("temp_auction_data").filter({}).run(conn, function(err, cursor) {
          if (err) console.log('error:',err)
      }).then(function(cursor){
          cursor.toArray(function(error, results) {
              if (error) throw error;
              if (results.length > 0){
                console.log('..... '+results.length+' new auction/s data fetched .....')
                job(results)
                r.table("temp_auction_data").filter({}).delete().run(conn, function(err, result) {
                    if (err) console.log('error:',err)
                    console.log('..... temp data cleared .....')
                })
              }
              else{
                console.log('..... no new auction in last 30 seconds .....')
              }
          });
      })
  })
}

const Queue = require('rethinkdb-job-queue')
const table = {
  name: 'AuctionQueue'
}
const db = {
  host: config.get('rdb_host'),
  port: config.get('rdb_port'),
  db: config.get('rdb_db')
}

const q = new Queue(db, table)

// console.log(dataFetch)

function job(newData){

  for (i=0;i<newData.length;i++){

    // Finds the old job with the same auctionId and type null and disables it.....
    q.findJob({ auctionId:newData[i].id,type:null}).then((savedJobs) => {
      savedJobs[0].status = 'disabled'
      return savedJobs[0].update()
    }).catch(err => console.error(err))

    const job = q.createJob({
      auctionId: newData[i].id,
      priority: 'highest',
      timeout: 600000,
      type: null
    })
    job.dateEnable = new Date(newData[i].dateEnable)

    q.process((job, next) => {
        try {
          // at successful completion send mail
          const r = require('rethinkdb')
          r.connect({
            host: config.get('rdb_host'),
            port: config.get('rdb_port'),
            db: config.get('rdb_db'),
            }, function(err, conn) {
                if (err) throw err;
                console.log('\n..... ATTEMPTING TO FETCH NEW AUCTIONS UPDATED/CREATED .....')
                r.table("bid_management_all_auction_services").filter({'id':job.auctionId}).update({'isBidEnds':true}).run(conn, function(err, cursor) {
                    if (err) console.log('error:',err)
                })
            })
          console.log('auction ' + job.auctionId + ' ended')
        } catch (err) {
          console.error(err)
          return next(err)
        }
    })

    q.addJob(job).then((savedJobs) => {
    }).then((savedJobs) => {
    }).catch(err => console.error(err))

  }
}

setInterval(fetchNewData,60000)
console.log('===================================================')
console.log('************* Timer Function Started **************')
console.log('===================================================')
