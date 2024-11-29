//fetch video function / process
document.getElementById("get-video-details").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("clicked here");
  document.getElementById("get-video-details").disabled = true;
  document.getElementById("get-video-details").style.backgroundColor =
    "rgb(173, 172, 172)";

  let urllink = document.getElementById("url-link").value.trim();

  if (urllink.length == 0) {
    // alert("Please enter the link to your video");
    document.getElementById("url-link").style.border = "1px solid #db143c";
  }

  //verify if link is youtube link
  let regExp =
    /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/;
  let match = urllink.match(regExp);
  if (!match) {
    document.getElementById("get-video-details").disabled = false;
    document.getElementById("get-video-details").style.backgroundColor =
      "black";
    return (document.getElementById("url-link").style.border =
      "1px solid #db143c");
    // return alert("Url is not youtube link, make sure to copy url completely");
  }

  // document.querySelector(".load").style.display = "Flex";
  //fetch video

  // fetch("http://127.0.0.1:5000/getVideo?videoUrl=" + urllink, {
  fetch("https://tubekatch.onrender.com/getVideo?videoUrl=" + urllink, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      document.getElementById("thumbnail").src = data.thumbnail;
      document.getElementById("video-title").innerText = data.title;

      let html = "";
      for (let i = 0; i < data.formats.length; i++) {
        if (data.formats[i].ext != "mp4") {
          continue;
        }

        // `${format.format_id} - ${format.ext} (${format.acodec || 'no audio'})`
        // html += `<option value="${data.formats[i].url}" data-pixel="${
        //   data.formats[i].resolution
        // }" data-format_id="${data.formats[i].format_id}">${
        //   data.formats[i].resolution
        // } ${data.formats[i].ext} ${
        //   data.formats[i].acodec || "no audio"
        // }</option>`;
        // html += `<option value="${data.formats[i].url}" data-pixel="${
        //   data.formats[i].resolution
        // }" data-format_id="${data.formats[i].format_id}">${
        //   data.formats[i].resolution
        // } ${data.formats[i].ext} ${
        //   data.formats[i].acodec || "no audio"
        // }</option>`;

        html += `<label
          class="text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#66333d] px-4 h-11 text-white has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#db143c] relative cursor-pointer">
        ${data.formats[i].resolution} ${data.formats[i].ext} ${
          data.formats[i].acodec || "no audio"
        }
          <input
            type="radio"
            class="invisible absolute"
            name="selected-video-format"
            value="${data.formats[i].url}" 
            data-pixel="${data.formats[i].resolution}" 
            data-format_id="${data.formats[i].format_id}"
          />
        </label>`;

        document.getElementById("video-format").innerHTML = html;
        document.getElementById("video-data").style.display = "flex";
      }

      // Set the maxTime based on the video duration
      const videoDuration = data?.duration; // Get the duration from the API response
      setSliderRange(videoDuration); // Update the slider maxTime

      // document.querySelector(".load").style.display = "none";
      document.getElementById("get-video-details").disabled = false;
      document.getElementById("get-video-details").style.backgroundColor =
        "#db143c";
    })
    .catch((err) => {
      alert(err);
      // document.querySelector(".load").style.display = "none";
      document.getElementById("get-video-details").disabled = false;
      document.getElementById("get-video-details").style.backgroundColor =
        "#db143c";
    });
});

// blob => {
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'video.mp4'; // Set a default name for the downloaded file
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   }
//   fetch("https://tubekatch.herokuapp.com/getVideo?VideoUrl=" + urllink)
// fetch("http://127.0.0.1:5000/getVideo?videoUrl=" + urllink, {
