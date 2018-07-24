const express = require('express');
const bodyParser = require('body-parser');
const database = require('./models/mongodb');
const { placeOrder } = require('./controllers/placeOrder');
const { takeOrder } = require('./controllers/takeOrder');


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
    const { params: { id } } = req;
    const { status, body } = await takeOrder(
      databaseClient,
      id,
    );
    res.status(status).send(body);
  });
};

startServer();

module.exports = app;
