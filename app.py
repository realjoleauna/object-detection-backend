import tensorflow as tf
import tensorflow_hub as hub
from flask import Flask, request, jsonify, render_template

# Bibliotecas adicionais
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import base64
import io

# Inicialização do Flask
app = Flask(__name__)

# URL do modelo de detecção de objetos pré-treinado
MODEL_URL = "https://tfhub.dev/google/openimages_v4/ssd/mobilenet_v2/1"

# Carregar o modelo de detecção de objetos
model = hub.load(MODEL_URL)

# Função para realizar a predição dos objetos detectados
def predict(body):
    # Obter a imagem em formato base64 do corpo da requisição
    base64img = body.get('image')
    img_bytes = base64.decodebytes(base64img.encode())

    # Detectar os objetos na imagem
    detections = detect(img_bytes)

    # Limpar os resultados da detecção
    cleaned = clean_detections(detections)

    # Retornar os resultados limpos como um dicionário
    return {'detections': cleaned}

# Função para realizar a detecção dos objetos na imagem
def detect(img):
    # Decodificar a imagem em bytes e converter para o formato apropriado
    image = tf.image.decode_image(img, channels=3)
    converted_img = tf.image.convert_image_dtype(image, tf.float32)[tf.newaxis, ...]

    # Fazer a predição usando o modelo carregado
    result = model.signatures["default"](converted_img)
    num_detections = len(result["detection_scores"])

    # Criar um dicionário com os resultados da predição
    output_dict = {key: value.numpy().tolist() for key, value in result.items()}
    output_dict['num_detections'] = num_detections

    # Retornar o dicionário contendo os resultados
    return output_dict

# Função para limpar os resultados da detecção dos objetos
def clean_detections(detections):
    cleaned = []
    max_boxes = 10
    num_detections = min(detections['num_detections'], max_boxes)

    # Organizar as detecções em um formato mais legível
    for i in range(0, num_detections):
        d = {
            'box': {
                'yMin': detections['detection_boxes'][i][0],
                'xMin': detections['detection_boxes'][i][1],
                'yMax': detections['detection_boxes'][i][2],
                'xMax': detections['detection_boxes'][i][3]
            },
            'class': detections['detection_class_entities'][i].decode('utf-8'),
            'label': detections['detection_class_entities'][i].decode('utf-8'),
            'score': detections['detection_scores'][i],
        }
        cleaned.append(d)

    # Retornar as detecções limpas em uma lista
    return cleaned

# Função para obter a imagem em formato base64 a partir do caminho do arquivo
def get_base64_from_image(image_path):
    with open(image_path, 'rb') as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode()
    return encoded_image

# Rota para a página inicial (index.html)
@app.route('/')
def index():
    return render_template('index.html')

# Rota para a API de detecção de objetos
@app.route('/api/detect', methods=['POST'])
def detect_objects():
    body = request.json
    response = predict(body)
    print(response)
    return jsonify(response)

# Execução do aplicativo Flask
if __name__ == '__main__':
    app.run(debug=True)
