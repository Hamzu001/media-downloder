import express, { json } from "express";
import cors from "cors";
import { JSDOM } from "jsdom";
import { TiktokDL } from "@tobyg74/tiktok-api-dl";
import ytdl from "ytdl-core";

const app = express();
app.use(cors());
app.use(json());

app.listen(5000, () => {
  console.log("Server Works !!! At port 5000");
});

app.post("/mediaapi", async (req, res) => {
  const url = req.body.url;
  console.log("media api");
  try {
    if (url.match("pin.it")) {
      const longUrl = await expandURL(url);
      const { hostname, pathname } = new URL(longUrl);
      const path = pathname.replace("/sent/", "");
      const finalUrl = `https://${hostname}${path}`;
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const body = await response.text();

      const video = new JSDOM(body).window.document.getElementsByTagName(
        "video"
      )[0].src;
      const outUrl = video.replace("/hls/", "/720p/").replace(".m3u8", ".mp4");
      console.log(outUrl);
      res.status(200).send({
        url: outUrl,
      });
    }

    if (url.match("pinterest.com")) {
      const { hostname, pathname } = new URL(url);
      const path = pathname.replace("/sent/", "");
      const finalUrl = `https://${hostname}${path}`;
      //   console.log(finalUrl)
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const body = await response.text();
      //   console.log(body)
      const video = new JSDOM(body).window.document.getElementsByTagName(
        "video"
      )[0].src;
      const outUrl = video.replace("/hls/", "/720p/").replace(".m3u8", ".mp4");
      console.log(outUrl);
      res.status(200).send({
        url: outUrl,
      });
    }

    if (url.match("tiktok.com")) {
      TiktokDL(url).then((result) => {
        res.send(result);
        // console.log(result)
      });
    }

    if (url.match("youtube.com")) {
      const videoID = ytdl.getURLVideoID(url);
      await ytdl.getInfo(videoID).then((info) => {
        const link = info.formats.filter((vl) => vl.itag == 18)[0].url;
        res.send({ url: link });
      });
    }
    
    if (url.match("youtu.be")) {
      const videoID = ytdl.getURLVideoID(url);
      await ytdl.getInfo(videoID).then((info) => {
        const link = info.formats.filter((vl) => vl.itag == 18)[0].url;
        res.send({ url: link });
      });
    }


  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

async function expandURL(shortenURL) {
  const uri = new URL(shortenURL);
  const path = uri.pathname;
  const finalUrl = `https://api.pinterest.com/url_shortener${path}/redirect/`;
  try {
    let response = await fetch(finalUrl, {
      method: "HEAD",
      redirect: "manual",
    });
    let location = response.headers.get("location");
    return location;
  } catch (error) {
    console.error(error);
    return null;
  }
}

