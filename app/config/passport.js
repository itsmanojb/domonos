const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

function init(passport) {

  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    // login
    // check email if exists
    const user = await User.findOne({
      email
    });
    if (!user) {
      return done(null, false, {
        message: 'Email not registered'
      });
    }
    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        return done(null, user, {
          message: 'Login success'
        });
      }
      return done(null, null, {
        message: 'Invalid login credential'
      })
    }).catch((err) => {
      return done(null, null, {
        message: 'Failed to login'
      })
    })
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    })
  });

}

module.exports = init;