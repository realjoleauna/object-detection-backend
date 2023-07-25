import tensorflow as tf
import tensorflow_hub as hub
from flask import Flask, request, jsonify, render_template

app = Flask(_name_)

# Load the pre-trained object detection model
MODEL_URL = "https://tfhub.dev/google/openimages_v4/ssd/mobilenet_v2/1"
model = hub.load(MODEL_URL)

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
    detection_classes = result['detection_classes'][0].astype(np.int64)
    detection_scores = result['detection_scores'][0]

    detected_objects = []
    for i in range(num_detections):
        label = detection_classes[i]
        score = detection_scores[i]
        detected_objects.append({'label': label, 'score': score})

    return jsonify({'objects': detected_objects})

if _name_ == '_main_':
    app.run(debug=True)
