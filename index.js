const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Add multer for file uploads
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

const audiobooksDir = path.join(__dirname, 'audiobooks');
const playbackTimesFile = 'playback-times.json';

// Set up storage for file uploads using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audiobooksDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.mpeg')) {
            res.setHeader('Content-Type', 'audio/mpeg');
        }
    }
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/audiobooks.json', (req, res) => {
    fs.readdir(audiobooksDir, (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error reading the audiobooks directory.');
            return;
        }

        const audiobooks = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.mpeg')).map(name => ({ name }));
        res.json(audiobooks);
    });
});

app.post('/upload', upload.single('audiobook'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;
    }
    updateAudiobooksJSON();
    res.json({ success: true, message: `Audiobook "${req.file.originalname}" uploaded successfully.` });
});

app.get('/playback-time', (req, res) => {
    const audiobook = req.query.audiobook;
    if (!audiobook) {
        res.status(400).send('Audiobook parameter is missing.');
        return;
    }

    fs.readFile(playbackTimesFile, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading playback times file:', err);
            res.status(500).send('Error loading playback time.');
            return;
        }

        let playbackTimes = {};
        try {
            playbackTimes = data ? JSON.parse(data) : {};
        } catch (parseErr) {
            console.error('Error parsing playback times file:', parseErr);
        }

        const time = playbackTimes[audiobook] || 0;
        res.json({ time });
    });
});

app.post('/save-playback-time', (req, res) => {
    const audiobook = req.query.audiobook;
    const time = parseFloat(req.query.time);

    if (!audiobook || isNaN(time)) {
        res.status(400).send('Invalid parameters.');
        return;
    }

    fs.readFile(playbackTimesFile, 'utf8', (err, data) => {
        let playbackTimes = {};
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading playback times file:', err);
            res.status(500).send('Error loading playback time.');
            return;
        }

        try {
            playbackTimes = data ? JSON.parse(data) : {};
        } catch (parseErr) {
            console.error('Error parsing playback times file:', parseErr);
        }

        playbackTimes[audiobook] = time;

        fs.writeFile(playbackTimesFile, JSON.stringify(playbackTimes), 'utf8', (err) => {
            if (err) {
                console.error('Error saving playback time:', err);
                res.status(500).send('Error saving playback time.');
            } else {
                res.sendStatus(200);
            }
        });
    });
});

app.delete('/delete-audiobook', (req, res) => {
    const name = req.query.name;
    if (!name) {
        res.status(400).json({ success: false, message: 'Audiobook name parameter is missing.' });
        return;
    }

    const filePath = path.join(audiobooksDir, name);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting audiobook:', err);
            res.status(500).json({ success: false, message: 'Error deleting audiobook. Please try again.' });
            return;
        }

        updateAudiobooksJSON();
        res.json({ success: true, message: `Audiobook "${name}" deleted successfully.` });
    });
});

app.get('/audiobooks/:name', (req, res) => {
    const audiobook = path.join(audiobooksDir, req.params.name);

    fs.stat(audiobook, (err, stats) => {
        if (err) {
            console.error('Error getting file stats:', err);
            return res.status(404).send('Audiobook not found.');
        }

        const range = req.headers.range;
        if (!range) {
            const head = {
                'Content-Length': stats.size,
                'Content-Type': 'audio/mpeg'
            };
            res.writeHead(200, head);
            fs.createReadStream(audiobook).pipe(res);
        } else {
            const positions = range.replace(/bytes=/, '').split('-');
            const start = parseInt(positions[0], 10);
            const total = stats.size;
            const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

            if (isNaN(start) || isNaN(end) || start >= total || end >= total) {
                return res.status(416).send('Range Not Satisfiable');
            }

            const chunksize = (end - start) + 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg'
            });

            const stream = fs.createReadStream(audiobook, { start, end })
                .on('open', () => {
                    stream.pipe(res);
                })
                .on('error', (streamErr) => {
                    console.error('Stream error:', streamErr);
                    res.status(500).send('Stream error');
                });
        }
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
        const audiobooks = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.mpeg')).map(name => ({ name }));
        fs.writeFile(path.join(__dirname, 'audiobooks.json'), JSON.stringify(audiobooks, null, 2), err => {
            if (err) console.log('Error writing file:', err);
        });
    });
}
