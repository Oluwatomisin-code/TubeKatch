// Utility function to format seconds into hh:mm:ss
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60); // Ensuring no decimal points in seconds

  // Format time in hh:mm:ss
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

// Helper function to pad numbers (e.g. 5 -> 05)
function pad(num) {
  return num < 10 ? "0" + num : num;
}

// Initialize slider variables
const timeSlider = document.getElementById("time-slider");
const sliderRange = document.getElementById("slider-range");
const startHandle = document.getElementById("start-handle");
const endHandle = document.getElementById("end-handle");
const startTimeLabel = document.getElementById("start-time-label");
const endTimeLabel = document.getElementById("end-time-label");

const minTime = 0; // Minimum time (0 seconds)
let maxTime = 100 * 60 * 60; // Maximum time (100 hours in seconds)
let startTime = minTime;
let endTime = maxTime;

function setSliderRange(duration) {
  maxTime = duration; // Set the maxTime to the video duration
  endTime = maxTime; // Set the end time to maxTime (video duration)
  updateSlider(); // Update the slider display
}

// Helper function to update the range slider and labels
function updateSlider() {
  const range = endTime - startTime;
  const sliderWidth = timeSlider.offsetWidth;

  // Update the position of the range slider
  sliderRange.style.left = `${(startTime / maxTime) * 100}%`;
  sliderRange.style.width = `${(range / maxTime) * 100}%`;

  // Update the position of the handles
  startHandle.style.left = `${(startTime / maxTime) * 100}%`;
  endHandle.style.left = `${(endTime / maxTime) * 100}%`;

  // Update the labels
  startTimeLabel.textContent = formatTime(startTime);
  endTimeLabel.textContent = formatTime(endTime);
}

// Function to handle mouse/touch movement for both handles
function handleDrag(e, isStartHandle) {
  const sliderRect = timeSlider.getBoundingClientRect();
  let offsetX;

  // If touch event, use touches array; if mouse event, use clientX
  if (e.touches) {
    offsetX = e.touches[0].clientX - sliderRect.left;
  } else {
    offsetX = e.clientX - sliderRect.left;
  }

  let newTime = (offsetX / sliderRect.width) * maxTime;

  // Prevent the handles from crossing each other
  if (isStartHandle) {
    // Ensure start time does not go past end time
    if (newTime >= endTime) {
      newTime = endTime - 1;
    }
    startTime = Math.max(minTime, newTime);
  } else {
    // Ensure end time does not go before start time
    if (newTime <= startTime) {
      newTime = startTime + 1;
    }
    endTime = Math.min(maxTime, newTime);
  }

  updateSlider();
}

// Improved event listeners to prevent scrolling interference on mobile
let draggingHandle = null; // Track which handle is being dragged

function onMove(e) {
  if (draggingHandle) {
    handleDrag(e, draggingHandle === "start");
  }
}

function onStart(e) {
  // Determine which handle was clicked
  if (e.target === startHandle) {
    draggingHandle = "start";
  } else if (e.target === endHandle) {
    draggingHandle = "end";
  }

  // Add event listeners for dragging
  document.addEventListener("mousemove", onMove);
  document.addEventListener("touchmove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchend", onEnd);
}

function onEnd() {
  draggingHandle = null;
  document.removeEventListener("mousemove", onMove);
  document.removeEventListener("touchmove", onMove);
  document.removeEventListener("mouseup", onEnd);
  document.removeEventListener("touchend", onEnd);
}

// Event listeners for dragging the handles
startHandle.addEventListener("mousedown", onStart);
startHandle.addEventListener("touchstart", (e) => {
  e.preventDefault();
  onStart(e);
});

endHandle.addEventListener("mousedown", onStart);
endHandle.addEventListener("touchstart", (e) => {
  e.preventDefault();
  onStart(e);
});

// Wait for the DOM content to be loaded before initializing the slider
document.addEventListener("DOMContentLoaded", function () {
  updateSlider();
});
