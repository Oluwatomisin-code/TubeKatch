// Function to get selected radio button value
function getSelectedFormat() {
  // Find the selected radio button within the group
  const selectedRadio = document.querySelector(
    'input[name="selected-video-format"]:checked'
  );

  // If a radio button is selected, return its value; otherwise, return null
  if (selectedRadio) {
    return selectedRadio;
  } else {
    return null; // No option selected
  }
}

//What happens when the download now button is clicked
document.getElementById("download").addEventListener("click", (e) => {
  const urllink = document.getElementById("url-link").value.trim();
  const itag = getSelectedFormat().value;
  const format_id = getSelectedFormat().getAttribute("data-format_id");
  !format_id && alert("No format selected");
  const title = document.getElementById("video-title").textContent;

  //strip title of non alphanumeric characters
  const regex = /[^A-Za-z0-9]/g;
  const newtitle = title.replace(regex, "");
  console.log(newtitle);

  //get trim checkbox
  const acceptTrim = document.getElementById("accept");
  console.log(acceptTrim, "trim check");
  //check if trim checkbox is checked and then make request
  if (acceptTrim.checked == true) {
    //start time variable declarations
    const starthr = document.getElementById("start-time-label").textContent;
    // startmin = document.getElementById("startmin").value,
    // startsec = document.getElementById("startsec").value;
    //end time variable declarations
    let endhr = document.getElementById("end-time-label").textContent;
    // endmin = document.getElementById("endmin").value,
    // endsec = document.getElementById("endsec").value;

    //start time to seconds, end time to seconds and duration computation in seconds
    // let start = 0,
    //   end = 0,
    //   duration = 0;
    // start = eval(starthr * 60 + startmin * 60 + startsec * 1);
    // end = eval(endhr * 60 + endmin * 60 + endsec * 1);
    // duration = end - start;

    return window.open(
      "http://127.0.0.1:5000/download?videoUrl=" +
        urllink +
        "&itag=" +
        itag +
        "&format_id=" +
        format_id +
        "&title=" +
        newtitle +
        "&str=" +
        starthr +
        "&end=" +
        endhr
    );
  }

  return window.open(itag);
});
