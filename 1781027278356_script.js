// =========================================================
// ১. কনফিগারেশন
// =========================================================
const BASE_VIDEO_URL = "https://debasis.installapkapps.workers.dev/?id=";
const JSON_URL = "https://raw.githubusercontent.com/appcreator05/user/refs/heads/main/test/movies.json";

const moviesGrid = document.getElementById('movies-grid');
const searchBar = document.getElementById('search-bar');
const popup = document.getElementById("videoPopup");
const loader = document.getElementById("loader");
const videoPlayer = document.getElementById("player");
const container = document.getElementById("container");

let allMovies = [];

// Plyr ইনিশিয়ালাইজেশন
const player = new Plyr('#player', {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume'],
    ratio: '16:9',
    clickToPlay: true,
    autoplay: false
});

// =========================================================
// ২. JSON থেকে ডাটা লোড
// =========================================================
async function fetchMovies() {
    try {
        const response = await fetch(JSON_URL);
        const data = await response.json();
        allMovies = data.map(m => ({
            title: m.title,
            thumbnail: m.poster,
            description: m.description,
            rating: m.rating || "N/A",
            videoId: m.id
        }));
        displayMovies(allMovies);
    } catch (err) { console.error("মুভি ডাটা লোড ব্যর্থ:", err); }
}

function displayMovies(moviesList) {
    if (!moviesGrid) return;
    moviesGrid.innerHTML = ""; 
    moviesList.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <div class="card-img-container" onclick="openPlayer('${movie.videoId}')">
                <img src="${movie.thumbnail}" alt="${movie.title}">
                <span class="rating-badge">${movie.rating}</span>
            </div>
            <div class="movie-details">
                <h3>${movie.title}</h3>
                <p>${movie.description}</p>
                <div class="btn-play" onclick="openPlayer('${movie.videoId}')">Play</div>
            </div>`;
        moviesGrid.appendChild(movieCard);
    });
}

// =========================================================
// ৩. ৩ সেকেন্ড চেকার ও প্লেয়ার কন্ট্রোল
// =========================================================
function openPlayer(id) {
    if (loader) loader.style.display = "flex";
    
    const checkUrl = "https://lh3.googleusercontent.com/u/0/d/" + id + "=w200-h200-p";
    const img = new Image();
    let isLinkValid = false;

    img.onload = () => { isLinkValid = true; };
    img.onerror = () => { isLinkValid = false; };
    img.src = checkUrl;

    setTimeout(() => {
        if (isLinkValid) {
            startActualPlayer(id);
        } else {
            if (loader) loader.style.display = "none";
            showThemePlayerError(); 
        }
    }, 3000);
}

function startActualPlayer(id) {
    popup.style.display = "block";
    document.body.style.overflow = "hidden";
    
    const finalVideoUrl = BASE_VIDEO_URL + id;
    player.source = { 
        type: 'video', 
        sources: [{ src: finalVideoUrl, type: 'video/mp4' }] 
    };
    
    player.once('canplay', () => {
        loader.style.display = "none";
        player.play().catch(e => console.log("Play failed:", e));
        fixPlyrTimeline();
    });
}

// =========================================================
// ৪. টাইমলাইন ফিক্স (টাইমলাইন স্কিপিং সমস্যার সমাধান)
// =========================================================
function fixPlyrTimeline() {
    const progressContainer = document.querySelector('.plyr__progress');
    if (!progressContainer) return;

    function handleSeek(e) {
        if (window.innerHeight > window.innerWidth) {
            const rect = progressContainer.getBoundingClientRect();
            const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            const relativeY = clientY - rect.top;
            let percentage = relativeY / rect.height;
            
            if (percentage < 0) percentage = 0;
            if (percentage > 1) percentage = 1;
            
            if (player.duration) {
                player.currentTime = player.duration * percentage;
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }

    progressContainer.removeEventListener('touchstart', handleSeek);
    progressContainer.removeEventListener('touchmove', handleSeek);
    progressContainer.removeEventListener('click', handleSeek);

    progressContainer.addEventListener('touchstart', handleSeek, { passive: false });
    progressContainer.addEventListener('touchmove', handleSeek, { passive: false });
    progressContainer.addEventListener('click', handleSeek, { passive: false });
}

// ইভেন্ট লিসেনারগুলো
player.on('enterfullscreen', () => setTimeout(fixPlyrTimeline, 500));
player.on('exitfullscreen', () => setTimeout(fixPlyrTimeline, 500));
window.addEventListener('orientationchange', () => setTimeout(fixPlyrTimeline, 500));

// =========================================================
// ৫. ফুলস্ক্রিন ও অন্যান্য কন্ট্রোল
// =========================================================
function toggleFull() {
    if (!container) return;
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => alert(err.message));
    } else {
        document.exitFullscreen();
    }
}

function closePlayer(){
    if(document.fullscreenElement) document.exitFullscreen();
    player.pause();
    popup.style.display = "none";
    document.body.style.overflow = "";
}

window.showThemePlayerError = () => document.getElementById("errorPopup").style.display = "flex";
window.closeThemeErrorPopup = () => document.getElementById("errorPopup").style.display = "none";
window.handleThemeCommentClick = () => {
    window.closeThemeErrorPopup();
    const commentSection = document.getElementById("comments") || document.getElementById("comment-holder");
    commentSection?.scrollIntoView({ behavior: 'smooth' });
}

searchBar?.addEventListener('input', (e) => {
    const word = e.target.value.toLowerCase();
    displayMovies(allMovies.filter(m => m.title.toLowerCase().includes(word)));
});

fetchMovies();