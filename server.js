const express = require('express');
const app = express();
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose')
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

app.use(express.static('public'));

app.use(expressLayouts);
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});