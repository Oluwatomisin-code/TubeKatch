const { response } = require('express');
const express = require('express');
const app = express();
const ytdl = require('ytdl-core')

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

app.get("/getVideo", async(req, res) => {
    const videoUrl = req.query.VideoUrl;
    console.log(videoUrl);
    const ytdlReq = await ytdl.getInfo(videoUrl);
    res.status(200).json(ytdlReq)

})

app.get("/download", (req, res) => {
    const videoUrl = req.query.VideoUrl;
    const itag = req.query.itag;
    const filename = req.query.title;
    res.header("Content-Disposition", `attachment;\ filename="${filename}.mp4"`)
    ytdl(videoUrl, {
        filter: format => format.itag == itag,
        start: 0,
        end: 23334
    }).pipe(res)
})
app.listen('4000', () => console.log("now listening to port 4000"));