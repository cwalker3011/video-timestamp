/**
 * HTML video element
 */
const senderVideo = document.getElementById('video-sender');
const receiverVideo = document.getElementById('video-receiver');
const startButton = document.getElementById('start-button');
const callButton = document.getElementById('call-button');

let senderStream;
let pc1;
let pc2;

/**
 * Start call.
 */
const start = async () => {
  console.log('Requesting local stream');
  startButton.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    console.log('Received local stream');
    senderVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
  } catch (e) {
    alert(`getUserMedia() error: ${e}`);
  }
}

startButton.addEventListener('click', start);
