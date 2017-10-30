# Bidding_Backend

This is a node based feathers JS service built for creating auction and place bid for various product.Using this CRUD service user can consume the API from anywhere and create auction and place bid for particuler auction.Currently the project has scope of placing an instant bid or generate auto-bidding by specifying max amount or time.All the data will be stored in Rethink db database.Following are the features that is covered in this version -

1. Instant bids 
2. Auto bid
3. create Auction 
4. Edit Auction's Data
5. Rethink db job queue for quing bidders 
6. Send mail to winner in the end of the auction
 
 
## Installing
```

    cd path/to/biddingBackend; 
    
    npm install; 
    
    npm install rethinkdb-job-queue -s
   
```
## Getting Started

```
Create table 'temp_auction_data' in db 'bidding_backend' in rethinkdb
```
````
run command -

HOST=localhost PORT=3030 RDB_HOST=localhost RDB_PORT=28015 npm start
````
HOST: host IP of your server (optional, default is localhost)

PORT: port on which to run this project on your server (optional, default is 3030)

RDB_HOST: IP on which your rethinkdb server is running (compulsory)

RDB_PORT: client driver connection port of your rethinkdb server (compulsory)

## API references 

API can be tested at - [Swagger](http://localhost:3030/docs/?url=/docs) - after you successfully start the project

## API Example

### To create a new Auction
```
{
  "BidIncrementedBy": "bid increament value",
  "EndBidDate": "end date in miliseconds",
  "StartingBid": "starting bid value",
  "UpperLimitBid": "upper limit of biddding value",
  "content": "content for the product",
  "currency": "currency" // $ or £ or ₹ ,
  "endOfAuctionMethod": "1", 
  "isBidEnds": "no",
  "owner": "ownar id",
  "product_sku": "sku no of product",
  "title": "title of the auction item"
}
```
### To place a new Bid
```
{
  "auctionId" : "Auction Id",
  "bidderId" : "bidder's user id",
  "upperLimit" : "Amount upper limit of bidder",
  "bidIncrementByBidder" : "bid increament value of a bidder",
  "isAuto" : "true", // true or false
  "cutOffTime" : "cutoff time in miliseconds",
  "numOfAllowedBids" : "number of max allowed bids",
	"placedBidByBidder" : "Amount of placed bid by bidders "
}
```

## Run with Docker

To run the project from docker you need to clone the project and run `docker-compose up`

## Prerequisites

`Node.js 7.5.0+` `NPM 5+`  are required.

## Built With

* [Webpack](https://webpack.js.org/) - The web framework used
* [gulp](http://gulpjs.com/) - Automated development toolkit

## Contributing

If you find a bug or want to contribute to the code or documentation, you can help by submitting an [issue](http://172.16.99.216/npaul/autoBid_backend/issues) or a [pull request](http://172.16.99.216/npaul/autoBid_backend//pulls)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
Feathers.js - [Feathers.js](https://github.com/feathersjs/feathers)


