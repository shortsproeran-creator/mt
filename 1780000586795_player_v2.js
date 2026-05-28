// Plyr-এর অফিশিয়াল JS লোড করা
var plyrJs = document.createElement('script');
plyrJs.src = 'https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.polyfilled.min.js';
document.head.appendChild(plyrJs);

// প্লেয়ারের জন্য ভিডিও কন্টেইনার তৈরি
document.write('<div id="playerContainer"><video id="videoPlayer" controls crossorigin playsinline></video></div>');

// প্লেয়ার ফাংশন
function openPlayer(videoUrl) {
    document.querySelector('.posterWrap').style.display = 'none';
    const container = document.getElementById('playerContainer');
    container.style.display = 'block';
    
    const video = document.getElementById('videoPlayer');
    video.src = videoUrl;
    
    setTimeout(function() {
        const player = new Plyr(video, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']
        });
        
        // ফুলস্ক্রিন হলে অটো ল্যান্ডস্কেপ করার ম্যাজিক কোড
        player.on('enterfullscreen', () => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(function(error) {
                    console.log("Orientation lock not supported or blocked:", error);
                });
            }
        });

        // ফুলস্ক্রিন থেকে বের হলে আবার নরমাল (Portrait) করার কোড
        player.on('exitfullscreen', () => {
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        });

        video.play();
    }, 400);
}