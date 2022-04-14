require("dotenv").config();
const yelp = require("yelp-fusion");

const {SessionModel} = require("../models/reqschema");

// eslint-disable-next-line no-undef
const API_KEY = process.env.API_KEY;
const client  = yelp.client(API_KEY);

const __makeSession = async (io, searchRequest) => {
  try {
    console.log(searchRequest);

    let searchResult = await client.search(searchRequest);
    const searchObj = JSON.parse(searchResult.body, null, 4);
    let dbObject = {};
    let cardData = [];

    console.log(searchObj.businesses);
    Object.values(searchObj.businesses).forEach(business => {
      console.log(business.name);
      dbObject[business.name] = 0;
      cardData.push({
        name: business.name,
        img_url: business.image_url
      });
    });
    
    let sess = new SessionModel({ restaurants: dbObject, cardData: cardData });
    console.log(sess);
    console.log(cardData);
    sess.save();

    const res = {
      status: 200,
      sessID: sess._id,
      cardData: cardData
    };
    
    io.emit("session:create", res);
  } catch (err) {
    const res = {
      status: 500,
      error: err,
    };
    io.emit("session:create", res);
  }
};

const __joinSession = async (io, joinID) => {
  try {
    const sess = await SessionModel.findByIdAndUpdate(joinID, {$inc: {["num_players"]: 1}}, {new: true});
    const res = {
      status: 200,
      sessID: sess._id,
      cardData: sess.cardData
    };

    io.emit("session:join", res);
  } catch (err) {
    const res = {
      status: 500,
      error: err,
    };
    io.emit("session:create", res);
  }
};

const __startSession = (io) => {
  io.emit("session:start");
};

const __increaseScore = async (io, sessID, name) => {
  try {
    const updatedDoc = await SessionModel.findByIdAndUpdate(sessID, {$inc: {[`restaurants.${name}`]: 1}}, {new: true});
    console.log(updatedDoc);
    console.log(updatedDoc.restaurants[name], updatedDoc.num_players);
    const currRestaurantScore = updatedDoc.restaurants[name];
    if ( currRestaurantScore === updatedDoc.num_players) {
      console.log("match found");
      io.emit("session:complete", name);
    }
  } catch {
    io.emit("session:updateErr");
  }
};

module.exports = (io, socket) => {
  
  const makeSession = async (searchRequest) => __makeSession(io, searchRequest);
  const joinSession = async (joinID) => __joinSession(io, joinID);
  const startSession = () => __startSession(io);
  const increaseScore= async(sessID, name) => __increaseScore(io, sessID, name);

  socket.on("session:create", makeSession);
  socket.on("session:join", joinSession);
  socket.on("session:start", startSession);
  socket.on("session:incScore", increaseScore);
};