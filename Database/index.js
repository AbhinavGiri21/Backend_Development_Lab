const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/Registration', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Could not connect to MongoDB', err);
    });

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
});

const Student = mongoose.model('Student', studentSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join('C:\\Users\\abc\\Desktop', 'Backend Development')));

app.get('/', (req, res) => {
    res.sendFile(path.join('C:\\Users\\abc\\Desktop\\Backend Development', 'a.html'));
});

app.post('/submit', async (req, res) => {
    try {
        const { name, dob, address, subject } = req.body;

        const newStudent = new Student({
            name,
            dob,
            address,
            subject,
        });

        await newStudent.save();

        res.status(200).send('Student details saved successfully!');
    } catch (error) {
        res.status(500).send('Error saving student details: ' + error.message);
    }
});

app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).send('Error fetching students: ' + error.message);
    }
});

app.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send('Student not found');
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).send('Error fetching student: ' + error.message);
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const { name, dob, address, subject } = req.body;
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { name, dob, address, subject },
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).send('Student not found');
        }
        res.status(200).send('Student details updated successfully!');
    } catch (error) {
        res.status(500).send('Error updating student details: ' + error.message);
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).send('Student not found');
        }
        res.status(200).send('Student deleted successfully!');
    } catch (error) {
        res.status(500).send('Error deleting student: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
