FROM node:alpine

ADD . /usr/src/app/

WORKDIR /usr/src/app/

RUN npm install
RUN npm install rethinkdb-job-queue -s


EXPOSE 3030

CMD NODE_ENV=production npm start
