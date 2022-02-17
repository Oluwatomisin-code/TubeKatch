const express = require('express');
const app = express();
const https = require('https')
const cors = require('cors')
const fs = require('fs');
const ytdl = require('ytdl-core');

const ffmpeg = require('fluent-ffmpeg');
const { Server } = require('http');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const server = https.createServer(app)
app.use(cors())
app.use(express.static('public'));


//load home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

//get video details
app.get("/getVideo", async(req, res) => {
    const videoUrl = req.query.VideoUrl;
    console.log('Fetching Youtube video');

    await ytdl.getInfo(videoUrl).then((info) => res.status(200).json(info)).catch((err) => console.log(err))
})


//download video
app.get("/download", async(req, res) => {

    //receiving variables form query and assigning them
    const videoUrl = req.query.VideoUrl;
    const itag = req.query.itag,
        start = req.query.str,
        dur = req.query.dur;
    const filename = `${req.query.title}.mp4`;

    //set responsse header
    res.header("Content-Disposition", `attachment;\ filename="${filename}.mp4"`)

    //get the video and set it to an accessible variable for ffmpeg
    const video = ytdl(videoUrl, { filter: format => format.itag == itag })


    //declaring download methods
    //downloadMet1 gets called when there is no cropping required
    downloadMet1 = () => {
        ffmpeg(video)
            .on('error', function(err) {
                console.log('wahala' + err);
            })
            .on('end', function(err) {
                if (!err) {
                    console.log('Trimming Done');
                    res.download(__dirname + '/temp/' + filename, (err) => {
                        if (err) throw err;
                        console.log('Download to client complete');
                        fs.unlink(__dirname + '/temp/' + filename, (err) => {
                            if (err) throw err;
                            console.log('File deleting completed');
                        })
                    })
                }
            })
            .saveToFile(__dirname + './temp/' + filename);
    }

    //downloadMet2 gets called when cropping is to start from beginning of video
    downloadMet2 = () => {
        ffmpeg(video)
            .setDuration(dur)
            .on('error', function(err) {
                console.log('wahala' + err);
            })
            .on('end', function(err) {
                if (!err) {
                    console.log('Trimming Done');
                    res.download(__dirname + '/temp/' + filename, (err) => {
                        if (err) throw err;
                        console.log('Download to client complete');
                        fs.unlink(__dirname + '/temp/' + filename, (err) => {
                            if (err) throw err;
                            console.log('File deleting completed');
                        })
                    })
                }
            })
            .saveToFile(__dirname + './temp/' + filename);
    }

    //downloadMet3 gets called when both start time and duration is gotten from frontend
    downloadMet3 = () => {
        ffmpeg(video)
            .setInput(start)
            .setDuration(dur)
            .on('error', function(err) {
                console.log('wahala' + err);
            })
            .on('end', function(err) {
                if (!err) {
                    console.log('Trimming Done');
                    res.download(__dirname + '/temp/' + filename, (err) => {
                        if (err) throw err;
                        console.log('Download to client complete');
                        fs.unlink(__dirname + '/temp/' + filename, (err) => {
                            if (err) throw err;
                            console.log('File deleting completed');
                        })
                    })
                }
            })
            .saveToFile(__dirname + './temp/' + filename);
    }
    if (start === undefined) {

        return downloadMet1();
    }
    if (start == 0) {

        if (dur) {

            return downloadMet2()
        }
    }
    return downloadMet3;


})



server.listen(process.env.PORT || '4000');