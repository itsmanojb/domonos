require('dotenv').config()
const express = require('express');
const app = express();
const EventEmitter = require('events');
// const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDBStore = require('connect-mongo')(session);
const passport = require('passport');
const PORT = process.env.PORT || 3000;


// DB Connection
const connectionString = 'mongodb://localhost/pizza';
mongoose.connect(
  connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log(`db connected successfully`);
  })
  .catch((err) => {
    console.log('Database error', err);
    process.exit(1);
  });

// Session store
const mongoStore = new MongoDBStore({
  mongooseConnection: connection,
  collection: 'sessions'
})

// Event emitter
const eventEmitter = new EventEmitter();
app.set('eventEmitter', eventEmitter);

// Session Config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))

// Passport config
const passportInit = require('./app/config/passport');
const {
  log
} = require('console');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
})

app.use(expressLayouts);
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

const server = app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});


// Socket

const io = require('socket.io')(server);
io.on('connection', (socket) => {
  // join
  socket.on('join', (roomId) => {
    socket.join(roomId)
  })
});

eventEmitter.on('order_update', (data) => {
  io.to(`order_${data.id}`).emit('order_updated', data)
});

eventEmitter.on('order_place', (data) => {
  io.to(`adminRoom`).emit('new_order', data)
});