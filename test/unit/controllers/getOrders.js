const { expect } = require('chai');
const sinon = require('sinon');

const { getOrders } = require('../../../src/controllers/getOrders');
const database = require('../../../src/models/mongodb');


describe('controllers/getOrders', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  describe('getOrders', async () => {
    it('should get order list for valid input', async () => {
      const client = sandbox.stub();
      const page = 1;
      const limit = 10;
      const orders = [{
        id: 1,
        distance: 101,
        status: 0,
      }, {
        id: 2,
        distance: 102,
        status: 0,
      }, {
        id: 3,
        distance: 101,
        status: 0,
      }];
      sandbox.stub(database, 'getOrders').returns(orders);

      const { status, body } = await getOrders(client, page, limit);

      expect(status).to.equal(200);
      expect(body).to.deep.equal(orders);

      const getOrdersData = database.getOrders;
      expect(getOrdersData.calledOnce).to.be.true;
      expect(getOrdersData.args[0][0]).to.equal(client);
      expect(getOrdersData.args[0][1]).to.equal(page);
      expect(getOrdersData.args[0][2]).to.equal(limit);
    });

    it('should get 400 if invalid page input', async () => {
      const client = sandbox.stub();
      const { status, body } = await getOrders(client, 'a', 10);

      expect(status).to.equal(400);
      expect(body.error).to.equal('INPUT_NOT_VALID');
    });

    it('should get 400 if invalid limit input', async () => {
      const client = sandbox.stub();
      const { status, body } = await getOrders(client, 1, 'a');

      expect(status).to.equal(400);
      expect(body.error).to.equal('INPUT_NOT_VALID');
    });
  });
});
