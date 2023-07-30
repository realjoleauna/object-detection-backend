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
        const dataURL = canvasOverlay.toDataURL();
        const base64img = dataURL.split(',')[1]; // Extract base64 image string
        sendImageToServer(base64img);
    }
};

const sendImageToServer = (base64img) => {
    fetch('/api/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set the content type to JSON
        },
        body: JSON.stringify({ 'image': base64img }) // Send image as a JSON object
    })
    .then(response => response.json())
    .then(data => {
        const responseText = JSON.stringify(data, null, 2);
        console.log(responseText);
        // Update the UI with the detected image (if applicable)
        if (data && data['image']) {
            displayImages(data['image']);
        } else {
            // If no image is detected, display an error message
            capturedPhoto.innerHTML = '<p>No object detected in the captured photo.</p>';
        }
    })
    .catch(error => console.error('Error:', error));
};

// Start the camera when the page loads
startCamera();
