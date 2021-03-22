from flask import Flask
from flask_socketio import SocketIO
import numpy as np
import base64
from io import BytesIO
import random
from pathlib import Path
from PIL import Image
from augmentation_functions import add_noise, rotate_image, translate, zoom
function_store = [add_noise, rotate_image, translate, zoom]
number_operations = len(function_store)
app = Flask(__name__)
# enable cors
socketio = SocketIO(app, cors_allowed_origins="*")  # allow all origins

''' demo code for creating json response
@app.route("/")
def home():
    return jsonify(home="WebSocket", code=200, status="OK")
'''
'''demo code for sending static file response
@app.route("/")
def home():
    return send_file("frontend/build/index.html")
'''


@socketio.on("connect")
def connected_successfully():
    print("connected successfully to CONNECT")

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

# images received to apply operations
@socketio.on("apply_operations")
def images_received(apply_operations_data):
    print("connected successfully to APPLY_OPERATIONS")
    # manipulation_data is a dictionary as follows
    # for 1st manipulation data we have these
    # param_1 : includes value of parameter in the appropiate range
    # prob_1 : is the probability of images on which param 1 is applied
    # if parameter is not applied then that parameter should be marked 0 both param_i and prob_i
    images_data = apply_operations_data["images"]
    manipulation_data = apply_operations_data["operations"]
    # print(manipulation_data)
    print(str(len(images_data)) + " images received to process")
    count = 0
    processed_data = []
    for single_image_data in images_data:
        #add unprocessed image to processed data list
        processed_data.append(single_image_data)       
        # convert str to array
        head64data, body64data = single_image_data["src"].split(',')
        image = Image.open(BytesIO(base64.b64decode(body64data)))
        image = image.convert("RGB")
        img = np.array(image)
        origin_img = rotate_image(image =img, factor=0)
        img = rotate_image(image =img, factor=0)
        modified = False
        
        # operations started on single image
        for i in range(0, number_operations):
            random_number = random.uniform(0, 1)
            if (manipulation_data["prob_"+str(i)]>=random_number):
                if not modified:
                    print("modification occured")
                modified = True
                img = function_store[i](image= img, factor= manipulation_data["param_"+str(i)])

        # convert array to pil image
        pil_img = Image.fromarray((img * 255).astype(np.uint8))
        origin_pil = Image.fromarray((origin_img * 255).astype(np.uint8))

        # save pil image in computer
        base_path = str(Path(__file__).parent.parent)+"\\archive\\Temp\\"
        if modified:
            pil_img.save("..\\archive\\Temp\\01\\01_"+str(count)+".png", "png")
            count += 1   
        origin_pil.save("..\\archive\\Temp\\01\\01_"+str(count)+".png", "png")
        count += 1

        #convert pil image to binary data
        buff = BytesIO()
        pil_img.save(buff, format="png")
        head64data = "data:image/png;base64,"
        body64data = base64.b64encode(buff.getvalue()).decode("utf-8")
        # update new image data
        if modified:
            single_image_data["src"] = head64data + body64data
            processed_data.append(single_image_data)
        print("images processed no. of imgs "+str(len(processed_data)))

    # send processed data
    socketio.emit("processed_images", processed_data)


if __name__ == '__main__':
    socketio.run(app)
