const { MongoClient } = require('mongodb');
const config = require('config');


function getCollectionItem(client, collection) {
  return client.collection(collection);
}

exports.connect = async () => {
  const mongoConfig = config.get('database.mongodb');
  const url = `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.dbName}`;

  try {
    return await MongoClient.connect(url);
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};

exports.placeOrder = async (client, data) => {
  const collectionItem = getCollectionItem(client, 'order');
  try {
    return await collectionItem.insert(data);
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};

exports.getOrder = async (client, id) => {
  const collectionItem = getCollectionItem(client, 'order');
  try {
    const order = await collectionItem.find({ id }).toArray();
    return (order[0]) ? order[0] : {};
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};

exports.getOrders = async (client, page = 1, limit = 10) => {
  const collectionItem = getCollectionItem(client, 'order');
  const skip = (page - 1) * limit;
  try {
    const orders = await collectionItem
      .find()
      .sort({ createTime: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    return orders;
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};

exports.takeOrder = async (client, id) => {
  const collectionItem = getCollectionItem(client, 'order');
  try {
    return await collectionItem.update(
      { id },
      { $set: { status: 1 } },
    );
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
};
