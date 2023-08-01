// Obtendo referências dos elementos HTML
const video = document.getElementById('video');
const canvasOverlay = document.getElementById('canvas-overlay');
const capturedPhoto = document.getElementById('captured-photo');

// Função para exibir imagens e detecções
const displayImages = (base64img, detections) => {
    const img = new Image();
    
    // Convertendo a imagem base64 para Blob
    const blob = dataURLtoBlob(`data:image/jpeg;base64,${base64img}`);
    img.src = URL.createObjectURL(blob);
    capturedPhoto.innerHTML = '';
    capturedPhoto.appendChild(img);

    if (detections) {
        const canvas = document.getElementById('canvas-overlay');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aguardando o carregamento da imagem antes de desenhar os círculos vermelhos
        img.onload = function () {
            // Configurando o tamanho do canvas para ser igual ao da foto capturada
            canvas.width = capturedPhoto.clientWidth;
            canvas.height = capturedPhoto.clientHeight;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            drawCircles(detections);
        };
    }
};

// Iniciando a câmera ao carregar a página
const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error('Erro ao acessar a webcam:', err);
    }
};

// Função para converter a imagem de base64 para Blob
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

// Função para capturar a imagem da câmera e enviá-la para o servidor
const captureImage = () => {
    if (canvasOverlay) {
        const ctx = canvasOverlay.getContext('2d');
        ctx.drawImage(video, 0, 0, canvasOverlay.width, canvasOverlay.height);
        const dataURL = canvasOverlay.toDataURL();
        const base64img = dataURL.split(',')[1]; // Extraindo a string da imagem em base64
        sendImageToServer(base64img);
    }
};

// Função para enviar a imagem para o servidor e receber as detecções
const sendImageToServer = (base64img) => {
    fetch('/api/detect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Definindo o tipo de conteúdo como JSON
        },
        body: JSON.stringify({ 'image': base64img }) // Enviando a imagem em formato JSON
    })
    .then(response => response.json())
    .then(data => {
        const responseText = JSON.stringify(data, null, 2);
        console.log(responseText);
        // Atualizando a interface com a imagem detectada (se aplicável)
        if (data && data['detections']) {
            displayImages(base64img, data['detections']);
        } else {
            // Se nenhuma imagem for detectada, exibir uma mensagem de erro
            capturedPhoto.innerHTML = '<p>Nenhum objeto detectado na foto capturada.</p>';
        }
    })
    .catch(error => console.error('Erro:', error));
};

// Função para desenhar os círculos vermelhos em torno dos objetos detectados
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

// Iniciando a câmera ao carregar a página
startCamera();
