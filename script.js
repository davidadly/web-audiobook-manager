document.addEventListener('DOMContentLoaded', function() {
  const player = document.getElementById('audiobook-player');
  const rewindBtn = document.getElementById('rewind');
  const fastForwardBtn = document.getElementById('fastforward');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeDisplay = document.getElementById('current-time');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const dropZone = document.getElementById('drop-zone');
  const validFileTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
  let currentAudiobook = null;

  dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropZone.classList.add('hover');
  });

  dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('hover');
  });

  dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropZone.classList.remove('hover');
      const files = event.dataTransfer.files;
      if (files.length > 0) {
          const file = files[0];
          if (validFileTypes.includes(file.type)) {
              const formData = new FormData();
              formData.append('audiobook', file, file.name);

              fetch('/upload', {
                  method: 'POST',
                  body: formData
              })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert(data.message);
                      fetchAudiobooks();
                  } else {
                      alert(data.message);
                  }
              })
              .catch(error => {
                  console.error('Error uploading audiobook:', error);
                  alert('Error uploading audiobook. Please try again.');
              });
          } else {
              alert('Invalid file type. Please upload an audio file.');
          }
      }
  });

  function fetchAudiobooks() {
      fetch('audiobooks.json')
          .then(response => response.json())
          .then(data => {
              const listContainer = document.getElementById('audiobook-list');
              listContainer.innerHTML = '<ul>' + 
                  data.map(book => `
                      <li onclick="playAudiobook('${book.name}')">
                          ${book.name}
                          <button class="delete-btn" onclick="deleteAudiobook(event, '${book.name}')">X</button>
                      </li>`).join('') +
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

  window.deleteAudiobook = function(event, name) {
      event.stopPropagation(); // Prevent triggering the playAudiobook function
      if (confirm('Do you want to delete this audiobook? Please confirm.')) {
          fetch(`/delete-audiobook?name=${encodeURIComponent(name)}`, { method: 'DELETE' })
              .then(response => response.json())
              .then(result => {
                  if (result.success) {
                      alert(result.message);
                      fetchAudiobooks();
                  } else {
                      alert(result.message);
                  }
              })
              .catch(error => {
                  console.error('Error deleting audiobook:', error);
                  alert('Error deleting audiobook. Please try again.');
              });
      }
  };

  rewindBtn.addEventListener('click', function() {
      player.currentTime = Math.max(0, player.currentTime - 5);
  });

  fastForwardBtn.addEventListener('click', function() {
      player.currentTime = Math.min(player.duration, player.currentTime + 5);
  });

  playBtn.addEventListener('click', function() {
      player.play();
  });

  pauseBtn.addEventListener('click', function() {
      player.pause();
      savePlaybackTime();
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
