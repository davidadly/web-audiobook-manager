const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Path to the audiobooks directory
const audiobooksDir = path.join(__dirname, 'audiobooks');

// Serve static files
app.use(express.static('.'));

// Endpoint to get audiobooks list
app.get('/audiobooks.json', (req, res) => {
    fs.readdir(audiobooksDir, (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error reading the audiobooks directory.');
            return;
        }

        const audiobooks = files.filter(file => file.endsWith('.mp3')).map(name => ({ name }));
        res.json(audiobooks);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    updateAudiobooksJSON();
});

function updateAudiobooksJSON() {
    fs.readdir(audiobooksDir, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        const audiobooks = files.filter(file => file.endsWith('.mp3')).map(name => ({ name }));
        fs.writeFile(path.join(__dirname, 'audiobooks.json'), JSON.stringify(audiobooks, null, 2), err => {
            if (err) console.log('Error writing file:', err);
        });
    });
}
