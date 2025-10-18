console.log("Lets write JavaScript..")
let currentSong = new Audio
let songs
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0; // safety check

    let mins = Math.floor(seconds / 60);
    let secs = Math.round(seconds % 60);

    // Handle edge case like 59.9 rounding to 60
    if (secs === 60) {
        mins++;
        secs = 0;
    }

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://10.191.221.170:5001/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // songs.push(decodeURI(element.href.split(`${folder}`)[1]))
            let a = decodeURIComponent(element.href)
            a = a.replace(/\\/g, "/");
            songs.push(a.split(`${folder}`)[1])

        }

    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>                 
                            <div class="info">
                                <img class="invert" src="img/music.svg" alt="">
                                <div>${decodeURI(song)}</div>                                
                            </div>
                            <div class="play-action">
                                <span class="play-now">Play Now</span>
                                <img  src="img/play.svg" alt="">
                            </div>
        </li>`;
    }
    //Attach eventlistner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", elements => {
            playMusic(e.querySelector(".info").lastElementChild.innerHTML)

        })

    })

    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track);
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"

    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}



const allRanges = document.querySelectorAll("input[type=range]");

allRanges.forEach(range => {
    function updateSlider() {
        const value = (range.value - range.min) / (range.max - range.min) * 100;
        range.style.setProperty('--value-percent', `${value}%`);
    }
    updateSlider(); // Set initial position
    range.addEventListener('input', updateSlider); // Update on drag
});

async function displayAlbums() {
    let a = await fetch(`http://10.191.221.170:5001/songs/`);
    let cardContainer = document.querySelector(".cardContainer");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let folders = []
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        a = e.href.replace("/%5C", "/")
        a = a.replace("%5C", "/")
        a = decodeURIComponent(a)
        console.log(a)
        if (a.includes("/songs")) {
            let folder = a.split("/").slice(-2)[0]
            // Get the meta data of the folder
            let ab = await fetch(`http://10.191.221.170:5001/songs/${folder}/info.json`);
            let response = await ab.json();
            console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"  class="card  bg-grey">
                        <div class="coverPic">
                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <img class="playbtn" src="img/playbtn.svg" alt="">
                        </div>
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div> `
        }
    }
}
async function main() {

    songs = await getSongs("songs/cs/");
    playMusic(songs[0], true)

    // Display all albums on teh page
    await displayAlbums();

    // Attach an event listner to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime /
            currentSong.duration) * 100 + "%";
    })

    //Adding event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Adding an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Adding an event listner to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add event listener to previous
    previous.addEventListener("click", () => {
        // Decode the filename before searching
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentTrack);

        if (index > 0) { // Check if index is greater than 0
            playMusic(songs[index - 1]);
        }
    })

    //Add event listener to next 
    next.addEventListener("click", () => {
        // Decode the filename before searching
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentTrack);

        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    })

    //Add event listener to volume seekbar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting up volume", e.target.value + "/100")
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Adding minimizing icon to the seekbar
    document.querySelector(".downarrow").addEventListener("click", e => {

    })


    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`);
            playMusic(songs[0]);

        })
    })

    function updateVolumeSlider() {
        // Get the volume slider input
        let volumeInput = document.querySelector(".range").getElementsByTagName("input")[0];

        // Calculate the percentage fill
        const value = (volumeInput.value - volumeInput.min) / (volumeInput.max - volumeInput.min) * 100;

        // Update the CSS variable to set the orange color
        volumeInput.style.setProperty('--value-percent', `${value}%`);
    }
    // Adding event listner to volume bar when clicked to maek it mute
    // Add event listener to volume icon to mute/unmute
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            // Mute the song
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentSong.volume = 0;
        } else {
            // Unmute the song
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 25;
            currentSong.volume = 0.25;
        }
        // Call the function to update the orange color!
        updateVolumeSlider();
    });









}

main();