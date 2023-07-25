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

def draw_boxes(image, boxes, classes, scores):
    image = Image.fromarray(image)
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()

    for i in range(len(scores)):
        if scores[i] > 0.5:  # Adjust this threshold to show only high-confidence detections
            ymin, xmin, ymax, xmax = tuple(boxes[i])
            im_width, im_height = image.size
            (left, right, top, bottom) = (xmin * im_width, xmax * im_width,
                                          ymin * im_height, ymax * im_height)

            draw.rectangle([(left, top), (right, bottom)], outline='red', width=3)
            draw.text((left, top), classes[i], font=font, fill='red')

    return np.array(image)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/detect', methods=['POST'])
def detect_objects():
    image_file = request.files['image']
    image = tf.image.decode_image(image_file.read(), channels=3)
    result = model(tf.expand_dims(image, axis=0))

    # Process the result to extract relevant information
    result = {key: value.numpy() for key, value in result.items()}

    num_detections = int(result['num_detections'][0])
    detection_boxes = result['detection_boxes'][0]
    detection_classes = result['detection_classes'][0].astype(np.int64)
    detection_scores = result['detection_scores'][0]

    detected_image = draw_boxes(image, detection_boxes, detection_classes, detection_scores)

    # Convert the image back to bytes to send it in the response
    detected_image_bytes = io.BytesIO()
    Image.fromarray(detected_image).save(detected_image_bytes, format='PNG')
    detected_image_bytes.seek(0)

    return send_file(detected_image_bytes, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True)
