const video = document.getElementById('video');
const canvasOverlay = document.getElementById('canvas-overlay');
const capturedPhoto = document.getElementById('captured-photo');

const displayImages = (base64img) => {
    const img = new Image();
    img.src = base64img;
    capturedPhoto.innerHTML = '';
    capturedPhoto.appendChild(img);
};

const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error('Error accessing webcam:', err);
    }
};

const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

const captureImage = () => {
    if (canvasOverlay) {
        const ctx = canvasOverlay.getContext('2d');
        ctx.drawImage(video, 0, 0, canvasOverlay.width, canvasOverlay.height);
    }
};

// Start the camera when the page loads
startCamera();
