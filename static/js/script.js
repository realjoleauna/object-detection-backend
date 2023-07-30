const video = document.getElementById('video');
const canvasOverlay = document.getElementById('canvas-overlay');
const capturedPhoto = document.getElementById('captured-photo');

const displayImages = (base64img, detections) => {
    const img = new Image();
    const blob = dataURLtoBlob(`data:image/jpeg;base64,${base64img}`);
    img.src = URL.createObjectURL(blob);
    capturedPhoto.innerHTML = '';
    capturedPhoto.appendChild(img);

    if (detections) {
        drawCircles(detections);
    }
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
        if (data && data['detections']) {
            displayImages(base64img, data['detections']);
        } else {
            // If no image is detected, display an error message
            capturedPhoto.innerHTML = '<p>No object detected in the captured photo.</p>';
        }
    })
    .catch(error => console.error('Error:', error));
};

const drawCircles = (detections) => {
    const canvas = document.getElementById('canvas-overlay');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(detection => {
        const { yMin, xMin, yMax, xMax } = detection.box;
        const x = xMin * canvas.width;
        const y = yMin * canvas.height;
        const width = (xMax - xMin) * canvas.width;
        const height = (yMax - yMin) * canvas.height;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.rect(x, y, width, height);
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(detection.label + ' (' + (detection.score * 100).toFixed(2) + '%)', x, y - 5);
    });
};

// Start the camera when the page loads
startCamera();
