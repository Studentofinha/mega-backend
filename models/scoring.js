const mongoose = require("mongoose");

const scoringSchema = new mongoose.Schema({
  //step 1
  uniqueId: {},
  passportSeries: {
    type: String,
  },
  jshir: {
    type: String,
  },
  check:{
    type:String
  },
  comment: {
    type:String
  },
  phoneNumber: {
    type: String,
  },
  cardNumber: {
    type: String,
  },
  date: {
    type: String,
    default: new Date(),
  },
  sellerId: {
    type: String,
  },
  sellerName: {
    type: String,
  },
  client_name: {
    type: String,
  },
  menedjerId: {
    type: String,
  },
  menedjerName: {
    type: String,
    default: "",
  },
  codeConfirmation: {
    type: String,
    default: "",
  },
  statusAdmin: {
    type: String,
    default: "Новый",
  },
  step: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: String,
   
  },
  acceptAt: {
    type: Date,
  },
  complatedAt: {
    type: String,
  },
  /// Step 2
  limitMoney: {
    type: String,
    default: "",
  },
  productName: {
    type: String,
  },
  productPrice: {
    type: String,
  },
  month: {
    type: String,
  },
  document1: {
    // type: String,
  },
  document2: {
    // type: String,
  },
  images: [
    {
      type: String,
    },
  ],
});

scoringSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

scoringSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Scoring", scoringSchema);
exports.scoringSchema = scoringSchema;
