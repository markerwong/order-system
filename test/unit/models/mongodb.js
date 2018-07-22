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

  describe('insert', () => {
    it('should run insert with input', async () => {
      const client = {
        collection: sandbox.stub().returns({
          insert: sandbox.stub(),
        }),
      };
      const collection = 'collection';
      const doc = {
        name: 'test',
      };
      const insertFunction = client.collection().insert;

      await mongodb.insert(client, collection, doc);

      expect(insertFunction.calledOnce).to.be.true;
      expect(insertFunction.getCall(0).args[0]).to.deep.equal(doc);
    });
  });

  describe('get', () => {
    it('should run get with input', async () => {
      const client = {
        collection: sandbox.stub().returns({
          find: sandbox.stub(),
        }),
      };
      const collection = 'collection';
      const query = {
        name: 'test',
      };
      const getFunction = client.collection().find;

      await mongodb.get(client, collection, query);

      expect(getFunction.calledOnce).to.be.true;
      expect(getFunction.getCall(0).args[0]).to.deep.equal(query);
    });
  });
});
