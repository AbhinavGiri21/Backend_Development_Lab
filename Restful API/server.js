const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let items = [
    { id: 1, name: 'Item1', description: 'This is item1' },
    { id: 2, name: 'Item2', description: 'This is item2' },
];

app.get('/', (req, res) => {
    res.send('Welcome to simple RESTful API');
});

app.get('/items', (req, res) => {
    res.json(items);
});

app.get('/items/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).send('Item not found');
    res.json(item);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});