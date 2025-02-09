const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const port = 3000;

const app = express();

// Middleware to parse JSON
app.use(express.json());
//readfiles easier instead of writing fs.promises.readFile(...)
const { readFile } = require('fs').promises;

// Connect to SQLite database
const db = new sqlite3.Database('mydatabase.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

app.get('/', async (req, res) => {
    res.send( await readFile('./src/index.html','utf8'));
});

app.listen(process.env.PORT || port, () => console.log('App listening on port ${port}'));