const uuidv4 = require('uuid/v4');
const config = require('config');
const googleMaps = require('@google/maps');
const { Promise } = require('q');

const database = require('../models/mongodb');


function isNumeric(number) {
  return !Number.isNaN(parseFloat(number)) && Number.isFinite(number);
}

function verifyLocation(location) {
  if (!location || location.length !== 2) { return false; }

  let [latitude, longitude] = location;
  latitude = Number(latitude);
  longitude = Number(longitude);
  if (!isNumeric(latitude) || !isNumeric(longitude)) {
    return false;
  }

  if (latitude > 90 || latitude < -90) { return false; }
  if (longitude > 180 || longitude < -180) { return false; }
  return true;
}

function getDistance(origin, destination) {
  const key = config.get('maps.key');
  const googleMapsClient = googleMaps.createClient({ key, Promise });

  return googleMapsClient.distanceMatrix({
    origins: [{ lat: origin[0], lng: origin[1] }],
    destinations: [{ lat: destination[0], lng: destination[1] }],
    mode: 'driving',
  }).asPromise()
    .then((response) => {
      const elements = response.json.rows[0].elements[0];
      if (elements && elements.status === 'OK') {
        return elements.distance.value;
      }

      return -1;
    })
    .catch((ex) => {
      console.error(ex.message);
      throw ex;
    });
}

function getID(createTime) {
  const timeHash = (+createTime).toString(32);
  return `${timeHash}-${uuidv4()}`;
}

exports.placeOrder = async (client, origin, destination) => {
  const errorDescription = { status: 500, body: { error: 'ERROR_DESCRIPTION' } };
  if (!verifyLocation(origin) || !verifyLocation(destination)) {
    return errorDescription;
  }

  try {
    const distance = await getDistance(origin, destination);

    if (distance === -1) {
      return errorDescription;
    }
    const createTime = new Date();
    const id = getID(createTime);
    const data = {
      id,
      origin,
      destination,
      distance,
      status: 0,
      createTime: createTime.getTime(),
    };

    await database.placeOrder(client, data);

    return {
      status: 200,
      body: {
        id,
        distance,
        status: 'UNASSIGN',
      },
    };
  } catch (ex) {
    return errorDescription;
  }
};
