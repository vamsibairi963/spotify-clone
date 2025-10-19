console.log("Lets write JavaScript..")
let currentSong = new Audio();
let songs = [];
let currFolder;
let musicLibrary; // NEW: To store all our music data

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    let mins = Math.floor(seconds / 60);
    let secs = Math.round(seconds % 60);
    if (secs === 60) {
        mins++;
        secs = 0;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// CHANGED: This function no longer fetches anything. It just reads our library.
function getSongs(folder) {
    currFolder = folder;
    // Find the album in our musicLibrary that matches the folder name
    const album = musicLibrary.albums.find(a => a.folder === folder);
    if (!album) {
        console.error("Album not found!");
        return [];
    }
    songs = album.songs; // Get the songs from the found album

    // Display the songs in the playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <div class="info">
                <img class="invert" src="img/music.svg" alt="">
                <div>${decodeURI(song).replace(".mp3", "")}</div>
            </div>
            <div class="play-action">
                <span class="play-now">Play Now</span>
                <img src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").lastElementChild.innerHTML + ".mp3");
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // This function was already correct! It builds the path perfectly.
    currentSong.src = `/songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// CHANGED: This now fetches our single info.json file
async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // Clear existing cards

    for (const album of musicLibrary.albums) {
        cardContainer.innerHTML += `<div data-folder="${album.folder}" class="card bg-grey">
            <div class="coverPic">
                <img src="/songs/${album.folder}/cover.jpg" alt="">
                <img class="playbtn" src="img/playbtn.svg" alt="">
            </div>
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    }

    // CHANGED: Load the playlist when a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", item => {
            const folder = item.currentTarget.dataset.folder;
            songs = getSongs(folder);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}


async function main() {
    // NEW: Fetch our entire music library ONCE at the start
    let response = await fetch(`/songs/info.json`);
    musicLibrary = await response.json();

    // Load the first album's songs by default
    if (musicLibrary.albums.length > 0) {
        const firstAlbumFolder = musicLibrary.albums[0].folder;
        songs = getSongs(firstAlbumFolder);
        playMusic(songs[0], true);
    }
    
    // Display all albums on the page
    await displayAlbums();

    // --- ALL YOUR OTHER EVENT LISTENERS CAN STAY EXACTLY THE SAME ---
    // They are well-written and don't need to be changed.
    // (play, pause, next, previous, seekbar, volume, hamburger, etc.)

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime /
            currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentTrack);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentTrack);
        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.25;
            document.querySelector(".range input").value = 25;
        }
    });
}

main();