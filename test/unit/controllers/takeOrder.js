const { expect } = require('chai');
const sinon = require('sinon');

const { takeOrder } = require('../../../src/controllers/takeOrder');
const database = require('../../../src/models/mongodb');


describe('controllers/placeOrder', () => {
  const sandbox = sinon.createSandbox();

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
  });
});
