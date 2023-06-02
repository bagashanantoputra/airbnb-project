const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'sdasfdgderq124133assfdsdfsdfwe1';

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bagashananto:airbnc123@cluster0.gltmsiw.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

app.get('/test', (req, res) => {
  res.json('test ok');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error('Missing required fields');
    }
    const hashedPassword = await bcrypt.hash(password, bcryptSalt);
    const newUser = await User.create({ name, email, password: hashedPassword });
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/login', async (req, res) => {
  const {email, password} = req.body;
  const userDoc = await User.findOne({ email });

  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({email:userDoc.email, id:userDoc._id}, jwtSecret, {}, (err, token) =>{
        if (err) throw err;
        res.cookie('token', token).json(userDoc)
      });
      
    } else {
      res.status(422).json('Password Failed');
    }
  } else {
    res.json('Not Found');
  }
});


app.get('/profile', async (req, res) => {
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      try {
        const userDoc = await User.findById(userData.id);
        res.json(userDoc);
      } catch (error) { 
        console.error(error);
        res.status(500).send('Server Error');
      }
    });
  } else {
    res.json(null);
  }
});


app.use((err, req, res, next) => {
  console.error(err. stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server started listening at http://localhost:${port}`);
});
