const guest = require('../app/http/middlewares/guest');
const homeController = require('../app/http/controllers/homeController');
const menuController = require('../app/http/controllers/menuController');
const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/cartController');
const userController = require('../app/http/controllers/userController');

function initRoutes(app) {
  app.get('/', homeController().index);
  app.get('/menus', menuController().index);
  app.get('/login', guest, authController().login);
  app.post('/login', authController().doLogin);
  app.get('/register', guest, authController().register);
  app.post('/register', authController().doRegister);
  app.post('/logout', authController().logout);
  app.get('/cart', cartController().index);
  app.post('/add-item', cartController().addItem);
  app.post('/remove-item', cartController().removeItem);
  app.post('/delete-cart-item', cartController().deleteItem);
  app.post('/add-address', userController().addAddress);
  app.post('/delete-address', userController().deleteAddress);
}

module.exports = initRoutes;