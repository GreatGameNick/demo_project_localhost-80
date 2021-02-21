const mongoose = require("mongoose")
const assert = require('assert');
const fs = require('fs');

const {BasketModel} = require('../models/baskets')
const {ROOT_PATH, port, MONGO_URL, authApiUrl, mode} = require("../../configuration")

// putProductToBasket, deleteProductAtBasket, getBasket


module.exports.putProductToBasket = async (req, res) => {
  await BasketModel.findOne({sessionID: req.sessionID}, function (err, basket) {
    assert.equal(err, null);
    return basket
  })
  .then(async basket => {
    if (!basket) {
      const basketInstance = new BasketModel({
        sessionID: req.sessionID,
        createdDate: Date.now(),
        basketPoints: [{
          shelf: req.body.shelf,
          _id: req.body._id
        }]
      })
      await basketInstance.save()
    } else {
      basket.basketPoints.push({shelf: req.body.shelf, _id:  req.body._id})
      await BasketModel.updateOne({sessionID: req.sessionID}, {basketPoints: basket.basketPoints}, function (err, res) {
        console.log(err)
      })
    }
  })
  res.sendStatus(200)
}


module.exports.getBasket = async (req, res) => {
  await BasketModel.findOne({sessionID: req.sessionID}, function (err, basket) {
    assert.equal(err, null);
    return basket
  })
  .then(basket =>
    basket == null ? res.send('basket is empty') : res.send(basket))
}


// module.exports.findOneOnTheShelf = async (req, res) => {    // use it
//   if (!req.session.i)
//     req.session.i = 0;
//   ++req.session.i;
//
//   let exactShelf = choseTheShelf(req)
//   let convertedId = new mongoose.Types.ObjectId(req.params._id)
//
//   await exactShelf.findOne({_id: convertedId}, function (err, product) {
//     assert.equal(err, null);
//     return product
//   })
//   .then(product => res.send(product))
// }









