document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('audiobook-player');
    const rewindBtn = document.getElementById('rewind');
    const fastForwardBtn = document.getElementById('fastforward');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const youtubeUrlInput = document.getElementById('youtube-url');
    const downloadBtn = document.getElementById('download-btn');
  
    let currentAudiobook = null;
  
    downloadBtn.addEventListener('click', function() {
      const url = youtubeUrlInput.value.trim();
      if (url) {
        fetch(`/download?url=${encodeURIComponent(url)}`)
          .then(response => response.text())
          .then(message => {
            alert(message);
            youtubeUrlInput.value = '';
            fetchAudiobooks();
          })
          .catch(error => {
            console.error('Error downloading audiobook:', error);
            alert('Error downloading audiobook. Please try again.');
          });
      }
    });
  
    function fetchAudiobooks() {
      fetch('audiobooks.json')
        .then(response => response.json())
        .then(data => {
          const listContainer = document.getElementById('audiobook-list');
          listContainer.innerHTML = '<ul>' + 
            data.map(book => `<li onclick="playAudiobook('${book.name}')">${book.name}</li>`).join('') +
            '</ul>';
        })
        .catch(error => {
          console.error('Error loading the audiobook list:', error);
          document.getElementById('audiobook-list').innerText = 'Failed to load audiobook list.';
        });
    }
  
    window.playAudiobook = function(name) {
      currentAudiobook = name;
      player.src = `audiobooks/${name}`;
      player.load();
  
      fetch(`/playback-time?audiobook=${encodeURIComponent(name)}`)
        .then(response => response.json())
        .then(data => {
          player.currentTime = data.time || 0;
          player.play();
          player.controls = true;
        })
        .catch(error => {
          console.error('Error loading playback time:', error);
          player.play();
          player.controls = true;
        });
    };
  
    rewindBtn.addEventListener('click', function() {
      player.currentTime = Math.max(0, player.currentTime - 5);
    });
  
    fastForwardBtn.addEventListener('click', function() {
      player.currentTime = Math.min(player.duration, player.currentTime + 5);
    });
  
    player.addEventListener('timeupdate', function() {
      const progressValue = player.currentTime / player.duration * 100;
      progressBar.value = progressValue;
      updateCurrentTime();
      savePlaybackTime();
    });
  
    progressBar.addEventListener('input', function() {
      player.currentTime = player.duration * (progressBar.value / 100);
    });
  
    function updateCurrentTime() {
      let totalSeconds = Math.floor(player.currentTime);
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = totalSeconds % 60;
      currentTimeDisplay.textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  
    function savePlaybackTime() {
      if (currentAudiobook) {
        fetch(`/save-playback-time?audiobook=${encodeURIComponent(currentAudiobook)}&time=${player.currentTime}`, {
          method: 'POST',
        })
          .catch(error => {
            console.error('Error saving playback time:', error);
          });
      }
    }
  
    fetchAudiobooks();
  });