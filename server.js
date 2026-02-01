// SIMPLE server.js
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

// When someone visits /api/track, save the event
app.post('/api/track', (req, res) => {
    const event = req.body;
    console.log('📝 Event received:', event);
    
    // Save to file
    const events = JSON.parse(fs.readFileSync('events.json', 'utf8') || '[]');
    events.push(event);
    fs.writeFileSync('events.json', JSON.stringify(events, null, 2));
    
    res.json({ ok: true });
});

// Serve HTML files
app.use(express.static('.'));

// Create empty events.json if it doesn't exist
if (!fs.existsSync('events.json')) {
    fs.writeFileSync('events.json', '[]');
    console.log('Created events.json file');
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log('✅ Server running: http://localhost:' + PORT);
});