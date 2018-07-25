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

    it('should get 500 if input is missing', async () => {
      const client = sandbox.stub();
      const { status, body } = await placeOrder(client, [1, 2]);

      expect(status).to.equal(500);
      expect(body.error).to.equal('ERROR_DESCRIPTION');
    });

    it('should get 500 if input origin is invalid', async () => {
      const client = sandbox.stub();
      const { status, body } = await placeOrder(client, [-1000, 2], [3, 4]);

      expect(status).to.equal(500);
      expect(body.error).to.equal('ERROR_DESCRIPTION');
    });

    it('should get 500 if input destination is invalid', async () => {
      const client = sandbox.stub();
      const { status, body } = await placeOrder(client, [1, 2], [-3000, 4]);

      expect(status).to.equal(500);
      expect(body.error).to.equal('ERROR_DESCRIPTION');
    });

    it('should get 500 if error occur on Google API', async () => {
      const client = sandbox.stub();
      const origin = [1, 2];
      const destination = [3, 4];
      sandbox.stub(database, 'placeOrder');
      sandbox.stub(googleMaps, 'createClient').returns({
        distanceMatrix: sandbox.stub().returns({
          asPromise: sandbox.stub().throws(new Error('API error')),
        }),
      });

      const { status, body } = await placeOrder(client, origin, destination);

      expect(status).to.equal(500);
      expect(body.error).to.equal('ERROR_DESCRIPTION');

      expect(googleMaps.createClient.calledOnce).to.be.true;
      expect(database.placeOrder.calledOnce).to.be.false;
    });

    it('should get 500 if error occur on models function', async () => {
      const client = sandbox.stub();
      const origin = [1, 2];
      const destination = [3, 4];
      const distance = 100;
      sandbox.stub(database, 'placeOrder').throws(new Error('API error'));
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

      expect(status).to.equal(500);
      expect(body.error).to.equal('ERROR_DESCRIPTION');

      expect(googleMaps.createClient.calledOnce).to.be.true;
      expect(database.placeOrder.calledOnce).to.be.true;
    });
  });
});
