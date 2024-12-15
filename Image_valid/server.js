const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

mongoose.connect('mongodb://localhost:27017/image_upload', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const { Schema } = mongoose;

const imageSchema = new Schema({
    name: String,
    email: String,
    address: String,
    image: {
        data: Buffer,
        contentType: String
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const Image = mongoose.model('Image', imageSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join('C:\\Users\\abc\\Desktop\\Backend', 'Image_valid')));

app.get('/', (req, res) => {
    res.sendFile(path.join('C:\\Users\\abc\\Desktop\\Backend\\Image_valid', 'index.html'));
});

app.post('/submit', upload.single('image'), async (req, res) => {
    const { name, email } = req.body;
    const image = req.file;

    if (!image) {
        return res.status(400).send('No image uploaded');
    }

    try {
        const maxSizeInBytes = 100 * 1024; // 100KB
        if (image.size > maxSizeInBytes) {
            return res.status(400).send('Image size exceeds 100KB');
        }

        const { width, height } = await sharp(image.buffer).metadata();
        const maxWidth = 1920;
        const maxHeight = 1080;
        if (width > maxWidth || height > maxHeight) {
            return res.status(400).send('Image resolution exceeds 1920x1080');
        }

        const newImage = new Image({
            name,
            email,
            image: {
                data: image.buffer,
                contentType: image.mimetype
            }
        });

        await newImage.save();
        res.send('Form submitted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
