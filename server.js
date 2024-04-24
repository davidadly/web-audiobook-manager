const express = require('express');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const app = express();
const PORT = 3000;

const audiobooksDir = path.join(__dirname, 'audiobooks');
const playbackTimesFile = 'playback-times.json';

app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3')) {
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

    const audiobooks = files.filter(file => file.endsWith('.mp3')).map(name => ({ name }));
    res.json(audiobooks);
  });
});

app.get('/download', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    res.status(400).send('URL parameter is missing.');
    return;
  }

  try {
    const info = await ytdl.getInfo(url);
    const audioFormat = 'mp3';
    const audioFileName = `${info.videoDetails.title}.${audioFormat}`;
    const audioFilePath = path.join(audiobooksDir, audioFileName);

    ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(fs.createWriteStream(audioFilePath))
      .on('finish', () => {
        res.send(`Audiobook "${info.videoDetails.title}" downloaded successfully.`);
        updateAudiobooksJSON();
      });
  } catch (err) {
    console.error('Error downloading audiobook:', err);
    res.status(500).send('Error downloading audiobook. Please check the YouTube URL and try again.');
  }
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

    const playbackTimes = data ? JSON.parse(data) : {};
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
    const playbackTimes = data ? JSON.parse(data) : {};
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