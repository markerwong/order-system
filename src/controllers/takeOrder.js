const database = require('../models/mongodb');


exports.takeOrder = async (client, id) => {
  const order = await database.getOrder(client, id);
  if (!order.id) {
    return { status: 404, body: { error: 'NOT_FOUND' } };
  }
  if (order.status !== 0) {
    return { status: 409, body: { error: 'ORDER_ALREADY_BEEN_TAKEN' } };
  }

  await database.takeOrder(client, id);
  return { status: 200, body: { status: 'SUCCESS' } };
};
