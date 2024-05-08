import express from "express";
import cors from "cors";
import { corsOptions } from "./utills.js";
import { JSDOM } from "jsdom";

const app = express();
app.use(express.json());

app.post("/media-api/pinterest", cors(corsOptions), async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "Enter video url" });

  if (["pinterest.com", "pin.it"].some((u) => url?.match(u)) != true) {
    return res.status(400).json({ message: "Enter pinterest video url" });
  }

  // if (!["pinterest.com", "pin.it"].some((u) => url?.match(u)))
  //   return res.status(400).json({ message: "Enter pinterest video url" });

  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      return res.status(400).json({ message: "Invalid url" });
    }

    const body = await response.text();
    const video = new JSDOM(body).window.document.getElementsByTagName(
      "video"
    )[0].src;
    if (!video) {
      return res.status(400).json({ message: "Invalid url" });
    }

    const videoUrl = video.replace("/hls/", "/720p/").replace(".m3u8", ".mp4");
    res.status(200).json({ url: videoUrl });
  } catch (error) {
    res.status(400).json({ message: "Api does not responce" });
    console.log(error);
  }
});

export default app;
