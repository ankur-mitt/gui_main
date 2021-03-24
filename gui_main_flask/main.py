from flask import Flask
from flask_socketio import SocketIO
import numpy as np
import base64
from io import BytesIO
import random
import os
import shutil
from pathlib import Path
from PIL import Image
from augmentation_functions import add_noise, rotate_image, translate, zoom
function_store = [add_noise, rotate_image, translate, zoom]
number_operations = len(function_store)
app = Flask(__name__)
# enable cors
socketio = SocketIO(app, cors_allowed_origins="*")  # allow all origins

base_path = str(Path(__file__).parent.parent)+"\\public\\archive\\"
train_path = base_path+"Train"
temp_path = base_path + "Temp"


@socketio.on("connect")
def connected_successfully():
    print("connected successfully")

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('file_import')
def first_time_setup(data):
    print("started file_import operation")
    names = data["name_list"]
    print(len(names))
    selected_class = data["class"]
    print("extracted data")
    train_path = "../public/archive/Train/"+str(selected_class)+"/"
    temp_path = "../public/archive/Temp/"+str(selected_class)+"/"
    shutil.rmtree(temp_path, ignore_errors=True)
    os.mkdir(temp_path)
    print("about to enter loop")
    for name in names:
        print("entered loop")
        temp_img = Image.open(train_path+name)
        temp_img.save(temp_path+name, "png")
    socketio.emit("load-images", "complete")    
    print("ending file_import")

# images received to apply operations
@socketio.on("apply_operations")
def images_received(apply_operations_data):
    print("connected successfully to APPLY_OPERATIONS")
    # manipulation_data is a dictionary as follows
    # for 1st manipulation data we have these
    # param_1 : includes value of parameter in the appropriate range
    # prob_1 : is the probability of images on which param 1 is applied
    # if parameter is not applied then that parameter should be marked 0 both param_i and prob_i
    images_data = apply_operations_data["images"]
    manipulation_data = apply_operations_data["operations"]
    selected_class = apply_operations_data["class"]
    # print(manipulation_data)
    print(str(len(images_data)) + " images received to process "+str(type(images_data))+ " "+str(type(images_data[0])))
    count = 0
    processed_data = []
    to_send_data = []
    working_dr = "../public/archive/Temp/"+str(selected_class)+"/"
    for name in images_data:
        image = Image.open(working_dr+name)
        img = np.array(image)
        img = rotate_image(image =img, factor=0)
        modified = False
        
        # operations started on single image
        for i in range(0, number_operations):
            random_number = random.uniform(0, 1)
            if (manipulation_data["prob_"+str(i)]>=random_number):
                if not modified:
                    print("modification occurred")
                modified = True
                img = function_store[i](image= img, factor= manipulation_data["param_"+str(i)])
    
        # convert array to pil image
        pil_img = Image.fromarray((img * 255).astype(np.uint8))

        # origin_pil = Image.fromarray((origin_img * 255).astype(np.uint8))

        # save pil image in computer
        # pil_img.save(working_dr+"/"+str(count)+".png", "png")
        processed_data.append(pil_img)
        
        count += 1   
        # origin_pil.save("..\\archive\\Temp\\01\\01_"+str(count)+".png", "png")
        # count += 1
        print("images processed no. of imgs "+str(len(processed_data)))
    
    shutil.rmtree(working_dr, ignore_errors=True)
    os.mkdir(working_dr)
    count = 0
    for i in range(0,len(processed_data)):
        image_shot = processed_data[i]
        name = images_data[i]
        image_shot.save(working_dr+"/"+name, "png")
        count += 1
    # send processed data
    to_send_Tile = map(lambda x: "archive/Temp/"+str(selected_class)+"/"+x, images_data )


    socketio.emit("processed_images", images_data)
    print("ending apply_operations")

if __name__ == '__main__':
    socketio.run(app)


# Here lies the code used for websockets

#add unprocessed image to processed data list
        # # processed_data.append(single_image_data)       
        # # convert str to array
        # head64data, body64data = single_image_data["src"].split(',')
        # image = Image.open(BytesIO(base64.b64decode(body64data)))
        # image = image.convert("RGB")
        # img = np.array(image)

        # #convert pil image to binary data
        # buff = BytesIO()
        # pil_img.save(buff, format="png")
        # head64data = "data:image/png;base64,"
        # body64data = base64.b64encode(buff.getvalue()).decode("utf-8")
        # # update new image data
        # single_image_data["src"] = head64data + body64data
        # processed_data.append(single_image_data)