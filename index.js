const express = require('express');
const app = express();
const ytdl = require('ytdl-core');
const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
app.use(express.static('public'));

//load home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html")
})

//get video details
app.get("/getVideo", async(req, res) => {
    const videoUrl = req.query.VideoUrl;
    console.log('Fetching Youtube video');

    await ytdl.getInfo(videoUrl).then((info) => res.status(200).json(info)).catch((err) => res.json(err))
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

    //create writable stream
    let stream = fs.createWriteStream(__dirname + '/temp/' + filename);


    //declaring download methods
    //downloadMet1 gets called when there is no cropping required
    downloadMet1 = () => {
        console.log("Met1 was called")
        ffmpeg(video)
            .on('error', function(err) {
                console.log('wahala ooo' + err);
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
            .saveToFile(stream);
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

            return downloadMet2();
        }
    }
    return downloadMet3();


})

app.listen(process.env.PORT || '4000');