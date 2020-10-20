const homeController = require('../app/http/controllers/homeController');
const menuController = require('../app/http/controllers/menuController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customer/cartController');
const userController = require('../app/http/controllers/customer/userController');
const orderController = require('../app/http/controllers/customer/orderController');
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');

function initRoutes(app) {

  app.get('/', homeController().index);
  app.get('/menus', menuController().index);

  // Auth Routes
  app.get('/login', guest, authController().login);
  app.post('/login', authController().doLogin);
  app.get('/register', guest, authController().register);
  app.post('/register', authController().doRegister);
  app.post('/logout', authController().logout);

  // Cart Routes
  app.get('/cart', cartController().index);
  app.post('/add-item', cartController().addItem);
  app.post('/remove-item', cartController().removeItem);
  app.post('/delete-cart-item', cartController().deleteItem);

  // Customer Routes
  app.post('/add-address', userController().addAddress);
  app.post('/delete-address', userController().deleteAddress);
  app.post('/current-address', userController().currentAddress);
  app.post('/edit-address', userController().editAddress);
  app.get('/orders', auth, orderController().index);
  app.post('/orders', auth, orderController().store);

  // Admin Routes
}

module.exports = initRoutes;