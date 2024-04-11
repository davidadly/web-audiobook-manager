document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('audiobook-player');
    const rewindBtn = document.getElementById('rewind');
    const fastForwardBtn = document.getElementById('fastforward');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');

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

    window.playAudiobook = function(name) {
        player.src = `audiobooks/${name}`;
        player.play();
        player.controls = true;
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
});
