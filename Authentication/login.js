const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join('C:\\Users\\abc\\Desktop\\Backend', 'Authentication')));

app.get('/', (req, res) => {
    res.sendFile(path.join('C:\\Users\\abc\\Desktop\\Backend\\Authentication', 'login.html'));
});
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/authDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(400).send('Error registering user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid password');
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(400).send('Error logging in');
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied');
    try {
        const verified = jwt.verify(token, 'your_jwt_secret');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
};

app.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Authentication', 'login.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
