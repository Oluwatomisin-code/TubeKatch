//What happens when the download now button is clicked
document.getElementById('download').addEventListener('click', () => {
    const urllink = document.getElementById("url-link").value.trim();
    const itag = document.getElementById("video-format").value;
    const title = document.getElementById('video-title').textContent;

    //strip title of non alphanumeric characters
    const regex = /[^A-Za-z0-9]/g;
    const newtitle = title.replace(regex, "");

    const pixel = document.getElementById('video-format').getAttribute('data-pixel');

    //get trim checkbox
    const acceptTrim = document.getElementById('accept')
        //check if trim checkbox is checked and then make request
    if (acceptTrim.checked == true) {
        //start time variable declarations
        const starthr = document.getElementById('starthr').value,
            startmin = document.getElementById('startmin').value,
            startsec = document.getElementById('startsec').value;
        //end time variable declarations
        let endhr = document.getElementById('endhr').value,
            endmin = document.getElementById('endmin').value,
            endsec = document.getElementById('endsec').value;

        //start time to seconds, end time to seconds and duration computation in seconds
        let start = 0,
            end = 0,
            duration = 0;
        start = eval((starthr * 60) + (startmin * 60) + (startsec * 1));
        end = eval((endhr * 60) + (endmin * 60) + (endsec * 1));
        duration = end - start;

        return window.open(process.env.PORT + "/download?VideoUrl=" + urllink + '&itag=' + itag + '&title=' + newtitle + '&str=' + start + '&dur=' + duration)
    }

    return window.open(process.env.PORT + "/download?VideoUrl=" + urllink + '&itag=' + itag + '&title=' + newtitle)

})