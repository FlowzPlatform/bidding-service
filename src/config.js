const config = require("config");
console.log("!!!!!!!!!!!!!!!!!############## ", config.get("rdb_host"))
module.exports = {
    rethinkdb: {
        db: "bidding_backend",
        servers: [
          {
            host:  config.get("rdb_host"),
            port: config.get("rdb_port")
          }
        ]
    }
}
