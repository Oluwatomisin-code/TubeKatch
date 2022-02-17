        //fetch video function / process
        document.getElementById("get-video-details").addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById("get-video-details").disabled = true;
            document.getElementById("get-video-details").style.backgroundColor = 'rgb(173, 172, 172)';
            document.querySelector('.load').style.display = 'Flex'

            let urllink = document.getElementById("url-link").value.trim()

            if (urllink.length == 0) {
                alert("Please enter the link to your video")
            }



            //verify if link is youtube link
            let regExp = /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/;
            let match = urllink.match(regExp)
            if (!match) {
                document.getElementById("get-video-details").disabled = false;
                document.getElementById("get-video-details").style.backgroundColor = 'black';
                return alert("Url is not youtube link, make sure to copy url completely")
            }


            //fetch video
            fetch("https://tubekatch.herokuapp.com/getVideo?VideoUrl=" + urllink)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                        // console.log(data.videoDetails.thumbnails.at(-1))
                    console.log(data.videoDetails.thumbnails[data.videoDetails.thumbnails - 1])
                        // console.log(data.videoDetails.lengthSeconds)

                    document.getElementById('thumbnail').src = data.videoDetails.thumbnails[data.videoDetails.thumbnails - 1].url;
                    document.getElementById('video-title').innerText = data.videoDetails.title;

                    let html = "";
                    for (let i = 0; i < data.formats.length; i++) {
                        if (data.formats[i].container != 'mp4') {
                            continue;
                        }

                        html += `<option value="${data.formats[i].itag}" data-pixel="${data.formats[i].qualityLabel}">${data.formats[i].qualityLabel} ${data.formats[i].container}</option>`;
                        document.getElementById('video-format').innerHTML = html;
                        document.querySelector('.video-data').style.display = 'flex';

                    }
                    document.querySelector('.load').style.display = 'none'
                    document.getElementById("get-video-details").disabled = false;
                    document.getElementById("get-video-details").style.backgroundColor = 'black';
                }).catch(err => alert(err))
        })