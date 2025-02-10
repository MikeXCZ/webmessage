const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

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

app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM auth WHERE username = ?', [username], (err, auth) => {
        if (err) {
            return res.json({ success: false, message: 'Database error' });
        }
        
        if (auth) {
            // User exists, check password
            bcrypt.compare(password, auth.password, (err, result) => {
                if (result) {
                    res.json({ success: true, message: 'Login successful' });
                } else {
                    res.json({ success: false, message: 'Incorrect password' });
                }
            });
        } else {
            // User does not exist, create new auth
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.json({ success: false, message: 'Error hashing password' });
                }
                
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
                    if (err) {
                        return res.json({ success: false, message: 'Error creating auth' });
                    }
                    res.json({ success: true, message: 'User registered successfully' });
                });
            });
        }
    });
});

app.listen(process.env.PORT || port, () => console.log('App listening on port ${port}'));