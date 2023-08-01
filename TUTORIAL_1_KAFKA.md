# Tutorial: Detecção de Objetos com TensorFlow, Flask, Kafka e Streaming da Webcam

Neste tutorial, vamos explicar como utilizar um projeto de detecção de objetos já existente, baseado em TensorFlow e Flask, e como atualizá-lo para realizar o streaming de frames de imagem da webcam para um tópico no Kafka. Além disso, vamos executar a detecção de objetos em cada frame usando um modelo pré-treinado e exibir os resultados em tempo real em um aplicativo web.

## Pré-requisitos

Antes de começar o tutorial, verifique se você possui os seguintes itens instalados em seu sistema:

- Python 3.x
- Apache Kafka
- Node.js (para o npm)

## Passo 1: Configuração

1. Clone o projeto de detecção de objetos existente do GitHub:

```bash
git clone <repository_url>
```

2. Instale as dependências do Python:

```bash
cd object-detection-backend
pip install -r requirements.txt
```

3. Inicie o servidor Flask:

```bash
python app.py
```

4. Acesse `http://localhost:5000/` em seu navegador para verificar se o aplicativo de detecção de objetos está funcionando corretamente.

## Passo 2: Inicialização do Kafka com Podman

1. Abra um terminal e inicie o Kafka usando o Podman com o seguinte comando:

```bash
podman run -d --name kafka -p 9092:9092 -p 2181:2181 -e ADVERTISED_HOST=localhost -e ADVERTISED_PORT=9092 docker.io/bitnami/kafka:latest
```
Esse comando iniciará um contêiner Kafka usando a imagem oficial do Kafka do Bitnami. Ele também mapeia a porta 9092 do contêiner para a porta 9092 do host, que é a porta padrão do Kafka, e mapeia a porta 2181 do contêiner para a porta 2181 do host, que é a porta do ZooKeeper.

O Kafka agora está em execução e pronto para receber as imagens transmitidas da webcam.

### Criação do Tópico no Kafka

2. Com o Kafka em execução, crie um tópico chamado webcam_images usando o seguinte comando:

```bash
podman exec -it kafka kafka-topics.sh --create --topic webcam_images --bootstrap-server localhost:9092
```

## Passo 3: Atualização do JavaScript para Transmitir os Frames

1. Crie um novo arquivo chamado `kafka.js` no diretório `static/js/`.

2. Instale a biblioteca `kafka-node` usando o npm:

```bash
cd static/js
npm install kafka-node
```

3. Atualize o arquivo `kafka.js` com o seguinte código para lidar com a transmissão de frames para o Kafka:

```javascript
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);

const sendFramestoKafka = (base64img) => {
    producer.send([{ topic: 'webcam_images', messages: base64img }], (err, data) => {
        if (err) {
            console.error('Erro ao enviar mensagem para o Kafka:', err);
        } else {
            console.log('Mensagem enviada para o Kafka:', data);
        }
    });
};

module.exports = { sendFramestoKafka };
```

4. Atualize o arquivo script.js para incluir o módulo kafka.js e chamar a função transmitirFramesParaKafka após capturar cada imagem:

```javascript
const kafka = require('./kafka');

// Outro código existente

const captureImage = () => {
    if (canvasOverlay) {
        const ctx = canvasOverlay.getContext('2d');
        ctx.drawImage(video, 0, 0, canvasOverlay.width, canvasOverlay.height);
        const dataURL = canvasOverlay.toDataURL();
        const base64img = dataURL.split(',')[1]; // Extrair string da imagem em base64

        kafka.sendFramestoKafka(base64img); // Transmitir frame para o Kafka

        // Resto do código existente
    }
};

// Resto do código existente
```

## Passo 4: Processamento do Fluxo Kafka e Detecção de Objetos
1. Adicione a biblioteca kafka-python ao arquivo requirements.txt para lidar com o consumidor do Kafka no Python:

2. Reinstale as dependências do Python:

```bash
pip install -r requirements.txt
```
3. Atualize o arquivo app.py para incluir o consumidor do Kafka e realizar a detecção de objetos:

```python
from kafka import KafkaConsumer

# Código existente

# Função para processar o fluxo do Kafka
def streamKafka():
    consumer = KafkaConsumer('webcam_images', bootstrap_servers='localhost:9092')

    for message in consumer:
        base64img = message.value
        resposta = predict({'image': base64img})
        print(resposta)
        # Código adicional para exibir detecções no aplicativo web (usando WebSocket para atualizações em tempo real)

# Atualizar a rota /api/detect para transmitir frames para o Kafka e realizar a detecção de objetos
@app.route('/api/detect', methods=['POST'])
def detectObject():
    body = request.json
    base64img = body.get('image')

    kafka_producer.send('webcam_images', base64img.encode())

    return jsonify({'mensagem': 'Frame enviado para o Kafka para detecção'})

if __name__ == '__main__':
    # Iniciar o consumidor do Kafka para processar frames
    streamKafka()
```

### Passo 5: Detecção de Objetos em Tempo Real no Aplicativo Web
Implementar a detecção de objetos em tempo real usando WebSocket e atualizar a interface do usuário do aplicativo web é um tópico mais avançado e requer configurações e código adicionais. Por questões de simplicidade, não incluiremos a implementação do WebSocket neste tutorial. No entanto, existem várias bibliotecas e exemplos disponíveis que demonstram como obter atualizações em tempo real usando WebSocket.

