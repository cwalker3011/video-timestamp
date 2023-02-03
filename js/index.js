/**
 * HTML video element
 */
const video = document.getElementById('video-display');

/**
 * Initialize webcam stream
 */
const initStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
    return stream;
  } catch (e) {
    console.log(e);
  };
};

/**
 * Stream to video component
 */
const startVideo = (stream) => {
  stream.getVideoTracks();
  video.srcObject = stream;
};

/**
 * Main script
 */
const main = async () => {
  const stream = await initStream();
  startVideo(stream);
};

main();
