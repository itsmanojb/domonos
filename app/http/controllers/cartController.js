const Menu = require('../../models/menu');

function cartController() {
  return {
    async index(req, res) {

      const data = await Menu.find({
        menuType: {
          "$in": ["beverage", "dessert", "sides"]
        }
      });
      const menus = data.map(menu => menu.toObject());

      const drinks = [],
        desserts = [],
        sides = [];

      menus.forEach(item => {
        if (item.menuType === 'beverage') {
          drinks.push(item);
        } else if (item.menuType === 'sides') {
          sides.push(item);
        } else if (item.menuType === 'dessert') {
          desserts.push(item);
        }
      });

      const additionalMenus = [
        ...drinks.sort(() => 0.5 - Math.random()).slice(0, 2),
        ...sides.sort(() => 0.5 - Math.random()).slice(0, 2),
        ...desserts.sort(() => 0.5 - Math.random()).slice(0, 2),
      ];

      // res.json(additionalMenus)
      res.render('customers/cart', {
        menus: additionalMenus
      });

    },
    addItem(req, res) {

      // check if empty cart
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0
        }
      }
      let cart = req.session.cart;

      // check if items not in cart
      if (!cart.items[req.body._id]) {
        if (req.body.menuType === 'pizza') {
          cart.items[req.body._id] = [{
            item: req.body,
            qty: 1
          }]
        } else {
          cart.items[req.body._id] = {
            item: req.body,
            qty: 1
          }
        }
      } else {
        if (req.body.menuType !== 'pizza') {
          cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
        } else {
          const alreadyAdded = cart.items[req.body._id].filter(it => it.item.size === req.body.size && it.item.crust === req.body.crust);
          if (alreadyAdded.length > 0) {
            const index = cart.items[req.body._id].findIndex(it => it.item.size === req.body.size && it.item.crust === req.body.crust);
            cart.items[req.body._id][index].qty = cart.items[req.body._id][index].qty + 1
          } else {
            cart.items[req.body._id].push({
              item: req.body,
              qty: 1
            })
          }
        }
      }
      cart.totalQty = cart.totalQty + 1;
      cart.totalPrice = cart.totalPrice + req.body.price;

      return res.json({
        cart
      })
    },
    removeItem(req, res) {

      let cart = req.session.cart;
      if (Array.isArray(cart.items[req.body._id])) {

        if (cart.items[req.body._id].length > 1) {
          return res.json({
            status: 'failed'
          });
        } else {
          if (cart.items[req.body._id].qty === 1) {
            delete cart.items[req.body._id];
          } else {
            cart.items[req.body._id][0].qty = cart.items[req.body._id][0].qty - 1
          }
          cart.totalQty = cart.totalQty - 1;
          cart.totalPrice = cart.totalPrice - req.body.price;
          return res.json({
            status: 'ok',
            cart
          });
        }
      }

      delete cart.items[req.body._id];
      cart.totalQty = cart.totalQty - 1;
      cart.totalPrice = cart.totalPrice - req.body.price;
      return res.json({
        status: 'ok',
        cart
      })
    },
  };
}

module.exports = cartController;