(function () {
  var video = document.getElementById("movieVideo");
  var cover = document.getElementById("playerCover");
  var configNode = document.getElementById("playerConfig");

  if (!video || !cover || !configNode) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configNode.textContent || "{}");
  } catch (error) {
    config = {};
  }

  var src = config.src;
  var hlsInstance = null;
  var bound = false;

  var attachSource = function () {
    if (bound || !src) {
      return;
    }
    bound = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = src;
  };

  var startPlayback = function () {
    attachSource();
    cover.style.display = "none";
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        cover.style.display = "flex";
      });
    }
  };

  cover.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
