const { expect } = require('chai');
const sinon = require('sinon');

const { takeOrder } = require('../../../src/controllers/takeOrder');
const database = require('../../../src/models/mongodb');


describe('controllers/placeOrder', () => {
  const sandbox = sinon.createSandbox();
  const errorMsg = 'Connection problem';

  afterEach(() => {
    sandbox.restore();
  });

  describe('takeOrder', async () => {
    it('should get success if order not taken by others', async () => {
      const client = sandbox.stub();
      const id = 'test-id';
      sandbox.stub(database, 'getOrder').returns({
        id,
        status: 0,
      });
      sandbox.stub(database, 'takeOrder');

      const { status, body } = await takeOrder(client, id);

      expect(status).to.equal(200);
      expect(body.status).to.equal('SUCCESS');

      const getOrderData = database.getOrder;
      expect(getOrderData.calledOnce).to.be.true;
      expect(getOrderData.args[0][0]).to.equal(client);
      expect(getOrderData.args[0][1]).to.equal(id);

      const takeOrderData = database.takeOrder;
      expect(takeOrderData.calledOnce).to.be.true;
      expect(takeOrderData.args[0][0]).to.equal(client);
      expect(takeOrderData.args[0][1]).to.equal(id);
    });

    it('should get 503 if error occur on model functions', async () => {
      const client = sandbox.stub();
      const id = 'test-id';
      sandbox.stub(database, 'getOrder').returns({
        id,
        status: 0,
      }).throws(new Error(errorMsg));

      const { status, body } = await takeOrder(client, id);

      expect(status).to.equal(503);
      expect(body.error).to.deep.equal('SERVICE_UNAVAILABLE');

      const getOrderData = database.getOrder;
      expect(getOrderData.calledOnce).to.be.true;
      expect(getOrderData.args[0][0]).to.equal(client);
      expect(getOrderData.args[0][1]).to.equal(id);
    });

    it('should get 404 if order not found', async () => {
      const client = sandbox.stub();
      const id = 'test-id';
      sandbox.stub(database, 'getOrder').returns({});
      sandbox.stub(database, 'takeOrder');

      const { status, body } = await takeOrder(client, id);

      expect(status).to.equal(404);
      expect(body.error).to.equal('NOT_FOUND');

      const getOrderData = database.getOrder;
      expect(getOrderData.calledOnce).to.be.true;
      expect(getOrderData.args[0][0]).to.equal(client);
      expect(getOrderData.args[0][1]).to.equal(id);

      const takeOrderData = database.takeOrder;
      expect(takeOrderData.calledOnce).to.be.false;
    });

    it('should get 409 if order taken by others', async () => {
      const client = sandbox.stub();
      const id = 'test-id';
      sandbox.stub(database, 'getOrder').returns({
        id,
        status: 1,
      });
      sandbox.stub(database, 'takeOrder');

      const { status, body } = await takeOrder(client, id);

      expect(status).to.equal(409);
      expect(body.error).to.equal('ORDER_ALREADY_BEEN_TAKEN');

      const getOrderData = database.getOrder;
      expect(getOrderData.calledOnce).to.be.true;
      expect(getOrderData.args[0][0]).to.equal(client);
      expect(getOrderData.args[0][1]).to.equal(id);

      const takeOrderData = database.takeOrder;
      expect(takeOrderData.calledOnce).to.be.false;
    });
  });
});
