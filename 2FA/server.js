const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("Error connecting to MongoDB:", err));

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    phoneNumber: String,
    profileImage: {
        contentType: String,
        filePath: String
    }
});

const User = mongoose.model('User', userSchema);

// Twilio configuration
const accountSid = 'AC1550279dfedf5f4922265e962cb7b8f5';
const authToken = '0c90049adba6573b39efbf2b4287a660';
const client = twilio(accountSid, authToken);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

app.use(express.static(path.join('C:\\Users\\abc\\Desktop\\Backend', '2FA')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Centralized error handling function
const handleError = (res, error, message = 'An error occurred') => {
    console.error(error);
    res.status(500).send(message);
};

// Registration route
app.post('/register', upload.single('profileImage'), async (req, res) => {
    const { username, email, password, confirmPassword, phoneNumber } = req.body;
    const profileImage = req.file;

    console.log('Uploaded file:', profileImage);

    if (!profileImage) {
        return res.status(400).send('Profile image is required');
    }

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user data without the Buffer
        const tempUserData = {
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            profileImage: {
                contentType: profileImage.mimetype,
                filePath: path.join('uploads', profileImage.filename)
            }
        };

        // Send verification code
        await client.verify.v2.services('VA02919cb33c3a28f1ebdfc72f7e47e6bd')
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });

        res.send(`
            <h2>Verify Your Phone Number</h2>
            <form action="/verify" method="POST">
                <input type="hidden" name="phoneNumber" value="${phoneNumber}">
                <label for="verificationCode">Enter Verification Code:</label>
                <input type="text" id="verificationCode" name="verificationCode" required>
                <button type="submit">Verify</button>
            </form>
        `);
    } catch (error) {
        handleError(res, error, 'Error during registration');
    }
});

// Verification route
app.post('/verify', async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;

    try {
        const verification_check = await client.verify.v2.services('VA02919cb33c3a28f1ebdfc72f7e47e6bd')
            .verificationChecks
            .create({ to: phoneNumber, code: verificationCode });

        if (verification_check.status === 'approved') {
            const newUser = new User(tempUserData);
            await newUser.save();
            res.send('Phone number verified and registration successful!');
        } else {
            res.status(400).send('Invalid verification code');
        }
    } catch (error) {
        handleError(res, error, 'Error during verification');
    }
});

// Download route for profile images
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('C:\\Users\\abc\\Desktop\\Backend', 'uploads', filename);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Error while sending file:', err);
            res.status(404).send('File not found');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
