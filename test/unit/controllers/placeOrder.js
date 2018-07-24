const { expect } = require('chai');
const sinon = require('sinon');
const googleMaps = require('@google/maps');

const { placeOrder } = require('../../../src/controllers/placeOrder');
const database = require('../../../src/models/mongodb');


describe('controllers/placeOrder', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  describe('placeOrder', async () => {
    it('should get order id if input is valid', async () => {
      const client = sandbox.stub();
      const origin = [1, 2];
      const destination = [3, 4];
      const distance = 100;
      sandbox.stub(database, 'placeOrder');
      sandbox.stub(googleMaps, 'createClient').returns({
        distanceMatrix: sandbox.stub().returns({
          asPromise: sandbox.stub().returns(Promise.resolve({
            json: {
              rows: [{
                elements: [{
                  status: 'OK',
                  distance: { value: distance },
                }],
              }],
            },
          })),
        }),
      });

      const { status, body } = await placeOrder(client, origin, destination);

      expect(status).to.equal(200);
      expect(body.id).to.not.null;
      expect(body.distance).to.not.null;
      expect(body.status).to.equal('UNASSIGN');

      const insertedData = database.placeOrder.args[0][1];

      expect(googleMaps.createClient.calledOnce).to.be.true;
      expect(database.placeOrder.calledOnce).to.be.true;
      expect(database.placeOrder.args[0][0]).to.equal(client);
      expect(insertedData.origin).to.deep.equal(origin);
      expect(insertedData.destination).to.deep.equal(destination);
      expect(insertedData.distance).to.equal(distance);
      expect(insertedData.status).to.equal(0);
    });
  });
});
