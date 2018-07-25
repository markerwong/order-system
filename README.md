# order-system

---

## Introduction

Provide three APIs to place, take and list orders. Integrate with Google Maps API to check the distance between origin and destination. This application is covered by end-to-end test, unit test and lint test which is ready for production.

---

## Requirement and get start

For Docker deployment

1. Prepare for docker

2. Run `sh start.sh` on root

For manual deployment

1. Prepare Node.js with version 8.9

2. Prepare MongoDB and start with port `27017`

3. Change the mongo host to `localhost` in `config/default.json`

4. Run `npm i` on root to install node dependencies

5. Run `npm run start` on root to start application

---

## End-to-end test

We contain API test for a end-to-end test with newman. Here are the steps for running end-to-end test.

1. Start service with docker or manual deployment

2. Go to the root of folder and run `npm run test:e2e`

3. Check the passing result
