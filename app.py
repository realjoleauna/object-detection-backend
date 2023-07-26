# app.py
import tensorflow as tf
import tensorflow_hub as hub
from flask import Flask, request, jsonify, render_template, send_file, Response
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import base64
import io

app = Flask(__name__)

# Load the pre-trained object detection model
MODEL_URL = "https://tfhub.dev/google/openimages_v4/ssd/mobilenet_v2/1"
model = hub.load(MODEL_URL)

def predict(body):
    base64img = body.get('image')
    img_bytes = base64.decodebytes(base64img.encode())
    detections = detect(img_bytes)
    cleaned = clean_detections(detections)

    return { 'detections': cleaned }

def detect(img):
    image = tf.image.decode_image(img, channels=3)
    converted_img = tf.image.convert_image_dtype(image, tf.float32)[tf.newaxis, ...]
    result = model.signatures["default"](converted_img)
    num_detections = len(result["detection_scores"])

    output_dict = {key: value.numpy().tolist() for key, value in result.items()}
    output_dict['num_detections'] = num_detections

    return output_dict

def clean_detections(detections):
    cleaned = []
    max_boxes = 10
    num_detections = min(detections['num_detections'], max_boxes)

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

    return cleaned

def get_base64_from_image(image_path):
    with open(image_path, 'rb') as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode()
    return encoded_image

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/detect', methods=['POST'])
def detect_objects():
    body = request.json
    response = predict(body)
    print(response)
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
    