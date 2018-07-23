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
      const insertFunction = client.collection('order').insert;

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
          find: sandbox.stub().returns(order),
        }),
      };
      const getFunction = client.collection('order').find;

      const result = await mongodb.getOrder(client, id);

      expect(result).to.deep.equal(order);
      expect(getFunction.calledOnce).to.be.true;
      expect(getFunction.args[0][0]).to.deep.equal({ id });
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
      const updateFunction = client.collection('order').update;

      await mongodb.takeOrder(client, id);

      expect(updateFunction.calledOnce).to.be.true;
      expect(updateFunction.args[0][0]).to.deep.equal({ id });
    });
  });
});
