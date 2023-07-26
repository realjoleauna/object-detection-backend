# app.py
import tensorflow as tf
import tensorflow_hub as hub
from flask import Flask, request, jsonify, render_template, send_file, Response
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io

app = Flask(__name__)

# Load the pre-trained object detection model
MODEL_URL = "https://tfhub.dev/google/openimages_v4/ssd/mobilenet_v2/1"
model = hub.load(MODEL_URL)

def detect(img):
    image_file = img
    image = tf.image.decode_image(image_file.read(), channels=3)
    result = model(tf.expand_dims(image, axis=0))

    # Process the result to extract relevant information
    result = {key: value.numpy() for key, value in result.items()}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/detect', methods=['POST'])
def detect_objects():
    

if __name__ == '__main__':
    app.run(debug=True)
