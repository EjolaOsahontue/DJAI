import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "data");
const dbFile = path.join(dataDir, "db.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ tracks: [] }, null, 2));

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use(express.static(projectRoot, { extensions: ["html"] }));

app.get("/api/tracks", (req, res) => {
  try {
    const raw = fs.readFileSync(dbFile, "utf-8");
    const data = JSON.parse(raw || "{}");
    res.json({ tracks: data.tracks || [] });
  } catch (e) {
    res.status(500).json({ error: "read_failed" });
  }
});

app.post("/api/tracks", (req, res) => {
  try {
    const tracks = Array.isArray(req.body?.tracks) ? req.body.tracks : [];
    const payload = { tracks };
    fs.writeFileSync(dbFile, JSON.stringify(payload, null, 2));
    res.json({ ok: true, count: tracks.length });
  } catch (e) {
    res.status(500).json({ error: "write_failed" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Playlist DJ server on http://localhost:${PORT}/`);
});

