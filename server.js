const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const http = require('http');
const WebSocket = require('ws');

const port = 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to parse JSON
app.use(express.json());
//readfiles easier instead of writing fs.promises.readFile(...)
const { readFile } = require('fs').promises;

// Connect to SQLite database
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

app.get('/', async (req, res) => {
    res.send( await readFile('./src/index.html','utf8'));
});

app.get('/chat', async (req, res) => {
    res.send( await readFile('./src/chat.html','utf8'));
});

app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM auth WHERE username = ?', [username], (err, auth) => {
        if (err) {
            console.error('❌ Database Error:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
                type: 'check register/login',
                error: err.message });
        }
        
        if (auth) {
            // User exists, check password
            bcrypt.compare(password, auth.password, (err, result) => {
                if (result) {
                    return res.json({ 
                        success: true, 
                        message: 'Login successful',
                        type: 'login' });
                } else {
                    console.error('❌ Incorrect password:', err.message);
                    return res.json({ 
                        success: false, 
                        message: 'Incorrect password',
                        type: 'login',
                        error: err.message });
                }
            });
        } else {
            // User does not exist, create new auth
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    console.error('❌ Error hashing password:', err.message);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error hashing password', 
                        type: 'hashing',
                        error: err.message });
                }
                
                db.post('INSERT INTO auth (username, password) VALUES (?, ?)', [username, hash], (err) => {
                    if (err) {
                        console.error('❌ Error creating auth:', err.message);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Error creating auth', 
                            type: 'register',
                            error: err.message });
                    }
                    return res.json({ 
                        success: true, 
                        message: 'User registered successfully',
                        type: 'register' });
                });
            });
        }
    });
});

// WebSocket connection
wss.on('connection', (ws) => {
    // Send all previous messages to the newly connected client
    db.get('SELECT * FROM messages', (err, rows) => {
        if (err) {
            console.error('❌ failed to load history:', err.message);
            return res.status(500).json({ 
                success: false, 
                message: 'failed to load history', 
                type: "history",
                error: err.message });
        } else {
            ws.send(JSON.stringify({
                sucess: true, 
                message:"sucessfully loaded history", 
                type: 'history', 
                data: rows }));
        }
    });

    ws.on('message', (message) => {
        // Store the message
        db.post('INSERT INTO messages (content) VALUES (?)', [message], (err) => {
            if (err) {
                console.error('❌ failed to upload history:', err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: 'failed to upload history', 
                    type: "message",
                    error: err.message });
            } else {
                // Broadcast the message to all clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ 
                            sucess: "true",
                            message: "sucessfully uploaded message",
                            type: 'message', 
                            data: message }));
                    }
                });
            }
        });
    });
});

app.listen(process.env.PORT || port, () => console.log('App listening on port ${port}'));