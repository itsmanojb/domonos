const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../../models/user');

function authController() {

  const _getRedirectUrl = (req) => {
    return req.user.role === 'admin' ? '/admin/orders' : '/menus';
  }

  return {
    login(req, res) {
      res.render('auth/login');
    },
    doLogin(req, res, next) {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          req.flash('error', info.message);
          return next(err);
        }
        if (!user) {
          req.flash('error', info.message);
          return res.redirect('/login');
        }
        req.logIn(user, (err) => {
          if (err) {
            req.flash('error', info.message);
            return next(err);
          }
          return res.redirect(_getRedirectUrl(req))
        })
      })(req, res, next);
    },
    register(req, res) {
      res.render('auth/register');
    },
    async doRegister(req, res) {
      const {
        name,
        email,
        password
      } = req.body;

      // Validation
      if (!name || !email || !password) {
        req.flash('error', 'All fields required');
        req.flash('name', name);
        req.flash('email', email);
        return res.redirect('/register');
      }

      User.exists({
        email
      }, (err, result) => {
        if (result) {
          req.flash('error', 'Email already used');
          req.flash('name', name);
          req.flash('email', email);
          return res.redirect('/register');
        }
      })

      const hashPw = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        password: hashPw
      });
      user.save().then(() => {
        // login
        req.flash('success', 'Account created. Login to continue.');
        return res.redirect('/login');
      }).catch((err) => {
        req.flash('error', 'Something went wrong');
        return res.redirect('/register');
      });
    },
    logout(req, res) {
      req.logout();
      return res.redirect('/login')
    }
  };
}

module.exports = authController;