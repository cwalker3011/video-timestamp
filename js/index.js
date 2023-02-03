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
 * Log video frame metadata.
 */
const logMetadata = (now, metadata) => {
  // Do something with the frame.
  console.log(now, metadata);
  // Re-register the callback to be notified about the next frame.
  video.requestVideoFrameCallback(logMetadata);
};

/**
 * Main script
 */
const main = async () => {
  const stream = await initStream();
  startVideo(stream);

  // Initially register the callback to be notified about the first frame.
  video.requestVideoFrameCallback(logMetadata);
};

main();
