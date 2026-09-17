let socket;

const $ = (id) => document.getElementById(id);

function log(msg) {
  $("log").textContent +=
    `[${new Date().toLocaleTimeString()}] ${msg}\n`;

  $("log").scrollTop = $("log").scrollHeight;
}

function setStatus(connected) {
  $("status").textContent = connected ? "ONLINE" : "OFFLINE";

  $("status").className =
    "status " + (connected ? "online" : "offline");

  $("connection").textContent =
    connected
      ? "WebSocket متصل است."
      : "اتصال برقرار نیست.";
}

function connect() {
  const protocol =
    location.protocol === "https:" ? "wss:" : "ws:";

  socket = new WebSocket(`${protocol}//${location.host}`);

  socket.onopen = () => {
    setStatus(true);
    log("WebSocket connected");
  };

  socket.onclose = () => {
    setStatus(false);
    log("WebSocket closed");
  };

  socket.onerror = () => {
    log("WebSocket error");
  };

  socket.onmessage = (event) => {
    log("RX: " + event.data);
  };
}

$("connect").onclick = connect;

$("sendText").onclick = async () => {
  const text = $("text").value.trim();

  if (!text) return;

  const response = await fetch("/uploadText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  log("uploadText: " + await response.text());
};

$("sendLocation").onclick = async () => {
  const latitude = $("lat").value.trim();
  const longitude = $("lon").value.trim();

  const response = await fetch("/uploadLocation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      latitude,
      longitude
    })
  });

  log("uploadLocation: " + await response.text());
};

connect();
