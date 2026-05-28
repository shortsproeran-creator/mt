// ১. সিএসএস ফাইলটি ডাইনামিকালি লোড করা
var plyrCss = document.createElement('link');
plyrCss.rel = 'stylesheet';
plyrCss.href = 'https://cdn.jsdelivr.net/gh/appcreator05/user@main/plyr.css';
document.head.appendChild(plyrCss);

// কাস্টম ৯০ ডিগ্রি রোটেশন সিএসএস ইনজেক্ট করা
var customStyle = document.createElement('style');
customStyle.innerHTML = `
.posterWrap{position:relative;width:100%;max-width:420px;margin:auto;cursor:pointer;border-radius:10px;overflow:hidden}
.posterWrap img{width:100%;display:block}
.playIcon{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70px;height:70px;background:rgba(0,0,0,.6);border-radius:50%;color:#fff;font-size:36px;display:flex;align-items:center;justify-content:center;transition:.25s}
.posterWrap:hover .playIcon{background:rgba(255,0,0,.85);transform:translate(-50%,-50%) scale(1.1)}
#videoPopup{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:999999;display:none}
#loader{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1000001;display:none;align-items:center;justify-content:center}
.spinner{width:48px;height:48px;border:4px solid #ffffff30;border-top:4px solid #fff;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#container{width:100%;height:100%;position:relative}
@media screen and (orientation: portrait) {
    .videoBox { position: absolute; top: 50%; left: 50%; width: 100vh; height: 100vw; transform: translate(-50%, -50%) rotate(90deg) !important; background: #000; overflow: hidden; }
    .videoBox .plyr__progress input[type=range] { pointer-events: none !important; opacity: 1 !important; }
    .videoBox .plyr__progress { pointer-events: auto !important; cursor: pointer; }
}
@media screen and (orientation: landscape) {
    .videoBox { position: absolute; inset: 0; width: 100%; height: 100%; background: #000; }
}
.videoBox .plyr, .videoBox video { width: 100% !important; height: 100% !important; }
.plyr--video { background: #000; }
.fullBtn,.fullBtn2,.closeBtn{position:fixed;z-index:1000002;background:#ffffff20;color:#fff;border:1px solid #ffffff50;border-radius:6px;padding:8px 14px;font-size:18px;cursor:pointer}
.fullBtn{left:35px;bottom:10px}
.fullBtn2{right:10px;bottom:16px}
.closeBtn{top:10px;right:10px;font-size:22px}
`;
document.head.appendChild(customStyle);

// ২. প্লেয়ারের পপআপ এইচটিএমএল লেআউটটি বডিতে ইনজেক্ট করা
var popupHTML = `
<div id="videoPopup">
  <div id="container">
    <div class="videoBox">
      <video id="player" playsinline preload="metadata">
          <source id="videoSource" src="" type="video/mp4">
          Browser not supported.
      </video>
    </div>
    <button class="fullBtn" onclick="toggleFull()">⛶</button>
    <button class="fullBtn2" onclick="toggleFull()">⛶</button>
    <button class="closeBtn" onclick="closePlayer()">✕</button>
  </div>
</div>
<div id="loader"><div class="spinner"></div></div>
`;
document.body.insertAdjacentHTML('beforeend', popupHTML);

// Plyr ইনিশিয়ালাইজ করা
var player;
setTimeout(function() {
    player = new Plyr('#player', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume'],
        ratio: '16:9',
        clickToPlay: true
    });
    
    player.on('enterfullscreen', (e) => {
        e.preventDefault();
        player.exitFullscreen();
        toggleFull();
    });
}, 500);

// টাইমলাইন ফিক্সার
function fixPlyrTimeline() {
    const progressContainer = document.querySelector('.plyr__progress');
    const seekInput = document.querySelector('.plyr__progress input[type=range]');
    if (!progressContainer || !seekInput) return;

    function handleSeek(e) {
        if (window.innerHeight > window.innerWidth) {
            const rect = progressContainer.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            const relativeY = touch.clientY - rect.top;
            let percentage = relativeY / rect.height;
            if (percentage < 0) percentage = 0;
            if (percentage > 1) percentage = 1;
            if (player.duration) {
                player.currentTime = player.duration * percentage;
                seekInput.value = percentage * (seekInput.getAttribute('max') || 100);
                seekInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (e.type === 'click') e.preventDefault();
            e.stopPropagation();
        }
    }
    progressContainer.addEventListener('touchstart', handleSeek, { passive: false });
    progressContainer.addEventListener('touchmove', handleSeek, { passive: false });
    progressContainer.addEventListener('click', handleSeek, { passive: false });
}

// মেইন ওপেন ফাংশন (যা পোস্ট থেকে শুধু ভিডিও আইডি রিসিভ করবে)
function openPlayer(videoId) {
  const popup = document.getElementById("videoPopup");
  const loader = document.getElementById("loader");
  const videoPlayer = document.getElementById("player");

  loader.style.display = "flex";
  popup.style.display = "block";
  document.body.style.overflow = "hidden";
  
  // আপনার ওয়ার্কার্স বেস লিংকের সাথে পোস্টের আইডি জোড়া হচ্ছে
  const fullWorkersUrl = "https://debasis.installapkapps.workers.dev/?id=" + videoId;
  
  player.source = {
      type: 'video',
      sources: [{ src: fullWorkersUrl, type: 'video/mp4' }]
  };
  
  videoPlayer.oncanplay = () => {
      loader.style.display = "none";
      player.play().catch(()=>{});
      setTimeout(fixPlyrTimeline, 500);
      if(screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch(()=>{});
      }
  };
}

function closePlayer(){
  if(document.fullscreenElement) document.exitFullscreen();
  player.pause();
  document.getElementById("videoPopup").style.display = "none";
  document.getElementById("loader").style.display = "none";
  document.body.style.overflow = "";
  if(screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
}

function toggleFull(){
  const popup = document.getElementById("videoPopup");
  if(!document.fullscreenElement){
    popup.requestFullscreen?.().then(()=>{
      if(screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch(()=>{});
      }
    }).catch(()=>{});
  } else {
    document.exitFullscreen();
  }
}
window.addEventListener('orientationchange', () => setTimeout(fixPlyrTimeline, 500));