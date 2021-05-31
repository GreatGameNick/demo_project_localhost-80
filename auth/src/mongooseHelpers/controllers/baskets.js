const assert = require('assert')
const {BasketModel} = require('../models/baskets')

module.exports.getBasket = async (req, res) => {
  if (!req.session.i)            //сессию инициализируем данным запросом, т.к. он посылается при загрузке сайта.
    req.session.i = 0;
  ++req.session.i;
  
  console.log('===== getBasket // req.sessionID => ', req.sessionID)
  
  await BasketModel.findOne({sessionID: req.sessionID}, function (err, basket) {
    assert.equal(err, null);
    return basket
  })
    .then(basket => basket == null ? res.send({basketPoints: []}) : res.send(basket))
}

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
        basket.basketPoints.push({shelf: req.body.shelf, _id: req.body._id})
        await BasketModel.updateOne({sessionID: req.sessionID}, {basketPoints: basket.basketPoints}, function (err, res) {
          console.log(err)
        })
      }
    })
  res.sendStatus(200)
}

module.exports.deleteProductAtBasket = async (req, res) => {
  console.log('req.header(\'accesstoken\')================', req.header('accesstoken') )  //Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.Iig5OTkpIDk5OS05OS05OSI=./LkG6veVVwyFYMK37lIbRykL6jOy90OaOpcPu3cUxe0=
  
  if(req.header('accesstoken') === '--') {
  
  }
  
  
  await BasketModel.findOne({sessionID: req.sessionID}, function (err, basket) {    //отбираем корзину ДАННОГО юзера
    assert.equal(err, null);
    return basket
  })
    .then(async basket => {
      if (req.query._id === 'all') {
        basket.basketPoints = []
      } else {
        let productPointIndex = basket.basketPoints.findIndex(item => item._id.toString() === req.query._id)
        if (productPointIndex > -1)
          basket.basketPoints.splice(productPointIndex, 1)
      }
      
      await BasketModel.updateOne({sessionID: req.sessionID}, {basketPoints: basket.basketPoints}, function (err, res) {
        console.log(err)
      })
    })
    .catch(error => {
      console.log('deleteProductAtBasket ====== ', error)
    })
  
  res.sendStatus(200)
}

module.exports.retrieveSessionBasket = (sessionID) => new Promise(resolve => {
  BasketModel.findOneAndDelete({sessionID: sessionID}, (err, sessionBasket) => {   //findOneAndDelete, в отличии от findOne, НЕ ПРОМИС(!). Then()- не сработает(!).
    if (err) console.log(err)
    
    if (sessionBasket)
      resolve(sessionBasket)
    else               //если авторизуемся - сразу, не отбирая до этого товар в СЕССИОННУЮ корзину.
      resolve({basketPoints: []})
  })
})






