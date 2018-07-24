const { expect } = require('chai');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const config = require('config');

const mongodb = require('../../../src/models/mongodb');


describe('models/mongodb', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  describe('connect', () => {
    it('should run connect with correct url', async () => {
      sandbox.stub(config, 'get').returns({
        host: 'localhost',
        port: 27017,
        dbName: 'assignment',
      });
      sandbox.stub(MongoClient, 'connect');

      await mongodb.connect();

      expect(config.get.calledOnce).to.be.true;
      expect(MongoClient.connect.calledOnce).to.be.true;
      expect(MongoClient.connect.getCall(0).args[0]).to.equal('mongodb://localhost:27017/assignment');
    });
  });

  describe('placeOrder', () => {
    it('should create order', async () => {
      const client = {
        collection: sandbox.stub().returns({
          insert: sandbox.stub(),
        }),
      };
      const data = {
        id: 'test-id',
        origin: [1, 2],
        destination: [3, 4],
        distance: 5,
        status: 0,
      };
      const insertFunction = client.collection().insert;

      await mongodb.placeOrder(client, data);

      expect(insertFunction.calledOnce).to.be.true;
      expect(insertFunction.args[0][0]).to.deep.equal(data);
    });
  });

  describe('getOrder', () => {
    it('should get order by id', async () => {
      const id = 'test-id';
      const order = {
        id,
        origin: [1, 2],
        destination: [3, 4],
        distance: 5,
        status: 0,
      };
      const client = {
        collection: sandbox.stub().returns({
          find: sandbox.stub().returns({
            toArray: sandbox.stub().returns([order]),
          }),
        }),
      };
      const findFunction = client.collection().find;

      const result = await mongodb.getOrder(client, id);

      expect(result).to.deep.equal(order);
      expect(findFunction.calledOnce).to.be.true;
      expect(findFunction.args[0][0]).to.deep.equal({ id });
    });
  });

  describe('getOrders', () => {
    it('should get order list', async () => {
      const page = 10;
      const limit = 2;
      const orders = [{
        id: 1,
        origin: [1, 2],
        destination: [3, 4],
        distance: 5,
        status: 0,
      }, {
        id: 2,
        origin: [1, 2],
        destination: [3, 4],
        distance: 5,
        status: 0,
      }];
      const client = {
        collection: sandbox.stub().returns({
          find: sandbox.stub().returns({
            sort: sandbox.stub().returns({
              skip: sandbox.stub().returns({
                limit: sandbox.stub().returns({
                  toArray: sandbox.stub().returns(orders),
                }),
              }),
            }),
          }),
        }),
      };
      const skip = (page - 1) * limit;
      const findFunction = client.collection().find;
      const skipFunction = findFunction().sort().skip;
      const limitFunction = skipFunction().limit;

      const result = await mongodb.getOrders(client, page, limit);

      expect(result).to.deep.equal(orders);
      expect(limitFunction.calledOnce).to.be.true;
      expect(skipFunction.args[1][0]).to.equal(skip);
      expect(limitFunction.args[0][0]).to.equal(limit);
    });
  });

  describe('takeOrder', () => {
    it('should take order by id', async () => {
      const id = 'test-id';
      const client = {
        collection: sandbox.stub().returns({
          update: sandbox.stub(),
        }),
      };
      const updateFunction = client.collection().update;

      await mongodb.takeOrder(client, id);

      expect(updateFunction.calledOnce).to.be.true;
      expect(updateFunction.args[0][0]).to.deep.equal({ id });
    });
  });
});
