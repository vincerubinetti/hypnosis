window.onload = async function () {
  cagePng = new Image();
  cagePng.src = "cage.png";
  audio = new (window.AudioContext || window.webkitAudioContext)();

  xhr1 = new XMLHttpRequest();
  xhr1.open("GET", "slowly.wav");
  xhr1.responseType = "arraybuffer";

  xhr1.onload = function () {
    xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "bees.wav");
    xhr2.responseType = "arraybuffer";

    xhr2.onload = function () {
      audio.decodeAudioData(xhr1.response, function (decoded) {
        slowlyWav = decoded;
        audio.decodeAudioData(xhr2.response, function (decoded) {
          beesWav = decoded;
          document.querySelector("button").style.display = "block";
          window.setTimeout(function () {
            document.querySelector("button").style.opacity = 1;
          }, 10);
        });
      });
    };
    xhr2.send();
  };
  xhr1.send();
};

function begin() {
  document.querySelector("button").onclick = null;
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  spin = 0;
  radius = 1920;
  scale = document.getElementById("scale");
  rotate = document.getElementById("rotate");

  audio = new (window.AudioContext || window.webkitAudioContext)();
  gain = audio.createGain();
  gain.gain.value = 0;
  slowly = audio.createBufferSource();
  slowly.buffer = slowlyWav;
  slowly.connect(gain);
  gain.connect(audio.destination);
  slowly.loop = true;
  slowly.start();
  gain.gain.linearRampToValueAtTime(1, audio.currentTime + 5);

  canvas.style.opacity = 1;
  window.setTimeout(function () {
    document.querySelector("button").style.display = "none";
  }, 1000);
  document.querySelector("button").style.opacity = 0;

  onResize();
  window.onresize = onResize;
  window.setInterval(step, 20);
  window.setTimeout(cage, 10 * 1000 + Math.random() * 10 * 1000);
}

function step() {
  spin += 8;
  draw();
}

function onResize() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  draw();
}

function draw() {
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var radius = Math.max(canvas.width / 2, canvas.height / 2) * 1.5;
  var points = [];
  var innerPoints = [];
  var outerPoints = [];
  for (var a = spin, r = 0; r < radius; a -= 2, r += 0.1 + r / 500) {
    var t = r / 10;
    var innerX = canvas.width / 2 + (r - t) * cos(a);
    var innerY = canvas.height / 2 - (r - t) * sin(a);
    var outerX = canvas.width / 2 + (r + t) * cos(a);
    var outerY = canvas.height / 2 - (r + t) * sin(a);
    innerPoints.push({ x: innerX, y: innerY });
    outerPoints.push({ x: outerX, y: outerY });
  }
  outerPoints.reverse();
  points = innerPoints.concat(outerPoints);

  ctx.globalAlpha = 1;
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var point of points) ctx.lineTo(point.x, point.y);
  ctx.closePath();
  ctx.fill();
}

function sin(angle) {
  return Math.sin((2 * Math.PI * angle) / 360);
}

function cos(angle) {
  return Math.cos((2 * Math.PI * angle) / 360);
}

function cage() {
  scale.style.transition = "";
  rotate.style.transition = "";

  scale.style.transform = "translate(-50%, -50%) scale(0)";
  rotate.style.transform =
    "rotate(" + String(-360 + Math.random() * 720) + "deg)";
  rotate.style.opacity = 1;

  window.setTimeout(function () {
    scale.style.transform = "translate(-50%, -50%) scale(2)";
    scale.style.transition = "transform 5s cubic-bezier(0.5, 0, 0.5, 0)";
    rotate.style.transition =
      "transform 5s linear, opacity 5s cubic-bezier(0.5, 0, 0.5, 0)";
    rotate.style.transform =
      "rotate(" + String(-360 + Math.random() * 720) + "deg)";
    rotate.style.opacity = 0;
  }, 100);

  bees = audio.createBufferSource();
  bees.buffer = beesWav;
  bees.connect(audio.destination);
  bees.start();

  window.setTimeout(cage, 10 * 1000 + Math.random() * 10 * 1000);
}
