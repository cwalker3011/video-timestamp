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
const offerOptions = {
  offerToReceiveAudio: 0,
  offerToReceiveVideo: 1
};

const getName = (pc) => {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

const getOtherPc = (pc) => {
  return (pc === pc1) ? pc2 : pc1;
}

const videoHandler = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame);
}

const onSetLocalSuccess = (pc) => {
  console.log(`${getName(pc)} setLocalDescription complete`);
}

const onSetRemoteSuccess = (pc) => {
  console.log(`${getName(pc)} setRemoteDescription complete`);
}

const onSetSessionDescriptionError = (error) => {
  console.log(`Failed to set session description: ${error.toString()}`);
}

const onCreateSessionDescriptionError = (error) => {
  console.log(`Failed to create session description: ${error.toString()}`);
}

const onAddIceCandidateSuccess = (pc) => {
  console.log(`${getName(pc)} addIceCandidate success`);
}

const onAddIceCandidateError = (pc, error) => {
  console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

const onIceStateChange = (pc, event) => {
  if (pc) {
    console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
  }
}

const onIceCandidate = async (pc, event) => {
  try {
    await (getOtherPc(pc).addIceCandidate(event.candidate));
    onAddIceCandidateSuccess(pc);
  } catch (e) {
    onAddIceCandidateError(pc, e);
  }
  console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

const onCreateAnswerSuccess = async (desc) => {
  console.log(`Answer from pc2:\n${desc.sdp}`);
  console.log('pc2 setLocalDescription start');
  try {
    await pc2.setLocalDescription(desc);
    onSetLocalSuccess(pc2);
  } catch (e) {
    onSetSessionDescriptionError(e);
  }
  console.log('pc1 setRemoteDescription start');
  try {
    await pc1.setRemoteDescription(desc);
    onSetRemoteSuccess(pc1);
  } catch (e) {
    onSetSessionDescriptionError(e);
  }
}

/**
 * Pipe through Insertable Streams.
 */
const gotRemoteTrack = (e) => {
  console.log('pc2 received remote stream');
  const frameStreams = e.receiver.createEncodedStreams();
  frameStreams.readable.pipeThrough(new TransformStream({
    transform: videoHandler
  }))
      .pipeTo(frameStreams.writable);
  receiverVideo.srcObject = e.streams[0];
}

const onCreateOfferSuccess = async (desc) => {
  console.log(`Offer from pc1\n${desc.sdp}`);
  console.log('pc1 setLocalDescription start');
  try {
    await pc1.setLocalDescription(desc);
    onSetLocalSuccess(pc1);
  } catch (e) {
    onSetSessionDescriptionError();
  }

  console.log('pc2 setRemoteDescription start');
  try {
    await pc2.setRemoteDescription({type: 'offer', sdp: desc.sdp.replace('red/90000', 'green/90000')});
    onSetRemoteSuccess(pc2);
  } catch (e) {
    onSetSessionDescriptionError();
  }

  console.log('pc2 createAnswer start');
  try {
    const answer = await pc2.createAnswer();
    await onCreateAnswerSuccess(answer);
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }
}

/**
 * Start local stream.
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

/**
 * Start call.
 */
const call = async () => {
  callButton.disabled = true;
  console.log('Starting call');
  const videoTracks = localStream.getVideoTracks();
  if (videoTracks.length > 0) {
    console.log(`Using video device: ${videoTracks[0].label}`);
  }
  /**
   * Create Peer Connections
   */
  pc1 = new RTCPeerConnection();
  console.log('Created local peer connection object pc1');
  pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
  pc2 = new RTCPeerConnection({
    encodedInsertableStreams: true,
  });
  console.log('Created remote peer connection object pc2');
  pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
  pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1, e));
  pc2.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc2, e));
  pc2.addEventListener('track', gotRemoteTrack);

  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
  console.log('Added local stream to pc1');

  try {
    console.log('pc1 createOffer start');
    const offer = await pc1.createOffer(offerOptions);
    await onCreateOfferSuccess(offer);
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }
}

startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
