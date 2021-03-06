const express = require('express');
const bodyParser = require('body-parser');
const database = require('./models/mongodb');
const { placeOrder } = require('./controllers/placeOrder');
const { takeOrder } = require('./controllers/takeOrder');
const { getOrders } = require('./controllers/getOrders');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const startServer = async () => {
  const databaseClient = await database.connect();

  app.post('/order', async (req, res) => {
    const { origin, destination } = req.body;
    const { status, body } = await placeOrder(
      databaseClient,
      origin,
      destination,
    );
    res.status(status).send(body);
  });

  app.put('/order/:id', async (req, res) => {
    const { status: requestStatus } = req.body;
    if (!(requestStatus) || requestStatus !== 'taken') {
      return res.status(400).send({ error: 'INPUT_NOT_VALID' });
    }

    const { params: { id } } = req;
    const { status, body } = await takeOrder(
      databaseClient,
      id,
    );
    res.status(status).send(body);
  });

  app.get('/order', async (req, res) => {
    const { query: { page, limit } } = req;
    const { status, body } = await getOrders(
      databaseClient,
      Number(page),
      Number(limit),
    );
    res.status(status).send(body);
  });
};

startServer();

module.exports = app;
