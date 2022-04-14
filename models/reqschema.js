const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");
const {Schema} = mongoose;

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);

const sessionSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    num_players: {
      type: Number,
      default: 1
    },
    restaurants: {
      type: Object,
      default: {}
    },
    cardData: [
      {
        name: String,
        img_url: String,
      }
    ]
  },
  {strict: true}
);

const SessionModel = mongoose.model("Session", sessionSchema);

module.exports = {SessionModel};