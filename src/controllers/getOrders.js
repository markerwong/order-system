const database = require('../models/mongodb');


function isPositiveInteger(number) {
  return !!(number && Number.isInteger(number) && number > 0);
}

exports.getOrders = async (client, page, limit) => {
  if (!isPositiveInteger(page) || !isPositiveInteger(limit)) {
    return { status: 400, body: { error: 'INPUT_NOT_VALID' } };
  }

  try {
    const orders = await database.getOrders(client, page, limit);
    const returnOrders = [];
    orders.forEach((order) => {
      returnOrders.push({
        id: order.id,
        distance: order.distance,
        status: order.status,
      });
    });
    return { status: 200, body: returnOrders };
  } catch (ex) {
    return { status: 503, body: { error: 'SERVICE_UNAVAILABLE' } };
  }
};
