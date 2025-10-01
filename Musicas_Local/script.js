let currentAudio = null;
let currentProgress = null;

function toggleMenu(menu) {
    const addMenu = document.getElementById("menu-add");
    const listMenu = document.getElementById("menu-list");
    if (menu === "add") {
        addMenu.classList.toggle("active");
        listMenu.classList.remove("active");
    } else {
        listMenu.classList.toggle("active");
        addMenu.classList.remove("active");
        renderPlaylists();
    }
}

function addMusic() {
    const name = document.getElementById("musicName").value.trim();
    const file = document.getElementById("musicFile").files[0];
    const playlist = document.getElementById("playlistName").value.trim() || "Geral";

    if (!name || !file) {
        alert("Preencha o nome e selecione um arquivo!");
        return;
    }

    let musics = JSON.parse(localStorage.getItem("musics")) || [];

    if (musics.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        alert("Já existe uma música com esse nome!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const musicData = { name, file: e.target.result, playlist };
        musics.push(musicData);
        localStorage.setItem("musics", JSON.stringify(musics));
        alert("Música adicionada!");
        document.getElementById("musicName").value = "";
        document.getElementById("musicFile").value = "";
        document.getElementById("playlistName").value = "";
    };
    reader.readAsDataURL(file);
}

function renderPlaylists() {
    const container = document.getElementById("playlistContainer");
    container.innerHTML = "";
    let musics = JSON.parse(localStorage.getItem("musics")) || [];

    const playlists = {};
    musics.forEach(m => {
        if (!playlists[m.playlist]) playlists[m.playlist] = [];
        playlists[m.playlist].push(m);
    });

    for (const playlistName in playlists) {
        const block = document.createElement("div");
        block.className = "playlist-block";
        block.innerHTML = `<h3>${playlistName}</h3>`;

        playlists[playlistName].forEach(m => {
            const item = document.createElement("div");
            item.className = "playlist-item";
            item.innerHTML = `<strong>${m.name}</strong>`;

            const player = document.createElement("div");
            player.className = "custom-player";

            const audio = new Audio(m.file);

            const controls = document.createElement("div");
            controls.className = "player-controls";

            const playBtn = document.createElement("button");
            playBtn.textContent = "▶";
            playBtn.onclick = () => {
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    if (currentProgress) currentProgress.value = 0;
                }
                audio.play();
                currentAudio = audio;
                currentProgress = seekBar;
            };

            const pauseBtn = document.createElement("button");
            pauseBtn.textContent = "⏸";
            pauseBtn.onclick = () => audio.pause();

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.onclick = () => removeMusic(m.name);

            controls.appendChild(playBtn);
            controls.appendChild(pauseBtn);
            controls.appendChild(removeBtn);

            const seekBar = document.createElement("input");
            seekBar.type = "range";
            seekBar.min = 0;
            seekBar.value = 0;
            seekBar.step = 0.01;
            seekBar.className = "seek-bar";

            const timeDisplay = document.createElement("div");
            timeDisplay.className = "time-display";
            timeDisplay.textContent = "00:00 / 00:00";

            audio.ontimeupdate = () => {
                seekBar.value = audio.currentTime;
                seekBar.max = audio.duration;
                timeDisplay.textContent = formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
            };

            seekBar.oninput = () => {
                audio.currentTime = seekBar.value;
            };

            const volumeControl = document.createElement("input");
            volumeControl.type = "range";
            volumeControl.min = 0;
            volumeControl.max = 1;
            volumeControl.step = 0.05;
            volumeControl.value = 1;
            volumeControl.className = "volume-control";
            volumeControl.oninput = () => audio.volume = volumeControl.value;

            player.appendChild(controls);
            player.appendChild(seekBar);
            player.appendChild(timeDisplay);
            player.appendChild(volumeControl);

            item.appendChild(player);
            block.appendChild(item);
        });

        container.appendChild(block);
    }
}

function removeMusic(name) {
    let musics = JSON.parse(localStorage.getItem("musics")) || [];
    musics = musics.filter(m => m.name !== name);
    localStorage.setItem("musics", JSON.stringify(musics));
    renderPlaylists();
}

function formatTime(sec) {
    if (isNaN(sec)) return "00:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}