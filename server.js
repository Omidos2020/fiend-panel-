const express = require("express");
const http = require("http");
const path = require("path");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({
    type: "hello",
    message: "Fiend test panel connected",
    time: new Date().toISOString()
  }));

  ws.on("message", (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); }
    catch { return; }

    // Classroom-safe event relay: no device-control commands are implemented.
    const event = {
      type: "event",
      receivedAt: new Date().toISOString(),
      data
    };

    for (const client of clients) {
      if (client.readyState === 1) client.send(JSON.stringify(event));
    }
  });

  ws.on("close", () => clients.delete(ws));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "fiend-panel", clients: clients.size });
});

app.post("/uploadText", (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  res.json({ ok: true, received: text.slice(0, 2000) });
});

app.post("/uploadLocation", (req, res) => {
  // Accepts test coordinates only; does not request or obtain device location.
  const { latitude, longitude } = req.body || {};
  res.json({
    ok: true,
    received: {
      latitude: Number(latitude),
      longitude: Number(longitude)
    }
  });
});

app.post("/uploadFile", (_req, res) => {
  res.status(501).json({
    ok: false,
    message: "File transfer is intentionally not enabled in the classroom-safe starter."
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Fiend panel listening on ${PORT}`);
});