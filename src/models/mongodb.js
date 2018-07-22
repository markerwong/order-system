const { MongoClient } = require('mongodb');
const config = require('config');

exports.connect = async () => {
  const mongoConfig = config.get('database.mongodb');
  const url = `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.dbName}`;

  try {
    return await MongoClient.connect(url);
  } catch (err) {
    return err;
  }
};

exports.insert = async (client, collection, doc) => {
  const collectionItem = client.collection(collection);

  try {
    return await collectionItem.insert(doc);
  } catch (err) {
    return err;
  }
};

exports.get = async (client, collection, query) => {
  const collectionItem = client.collection(collection);

  try {
    return await collectionItem.find(query).toArray();
  } catch (err) {
    return err;
  }
};
