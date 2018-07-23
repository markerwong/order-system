const { MongoClient } = require('mongodb');
const config = require('config');

async function get(client, collection, query) {
  const collectionItem = client.collection(collection);
  try {
    return await collectionItem.find(query);
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
}

async function insert(client, collection, doc) {
  const collectionItem = client.collection(collection);
  try {
    return await collectionItem.insert(doc);
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
}

async function update(client, collection, query, value) {
  const collectionItem = client.collection(collection);
  try {
    return await collectionItem.update(query, { $set: value });
  } catch (ex) {
    console.error(ex.message);
    throw ex;
  }
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
  await insert(client, 'order', data);
};

exports.getOrder = async (client, id) => {
  const order = await get(client, 'order', { id });
  return order;
};

exports.takeOrder = async (client, id) => {
  await update(client, 'order', { id }, { status: 1 });
};
