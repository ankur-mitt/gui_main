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
import csv
import threading, time
from augmentation_functions import add_noise, rotate_image, translate, zoom
from result import labels_Pred, Confusion_Matrix, data_dictionary, Accuracy_score, Precision_score, F1_score, Recall_score, report
function_store = [add_noise, rotate_image, translate, zoom]
augment_store = [Confusion_Matrix, data_dictionary, Accuracy_score, Precision_score, F1_score, Recall_score, report]
number_operations = len(function_store)
app = Flask(__name__)
# number of classes (not final class number)
num_classes = 48 
# enable cors
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=300, ping_interval=30)  # allow all origins

base_path = str(Path(__file__).parent.parent)+"\\public\\archive\\"
train_path = base_path+"Train"
temp_path = base_path + "Temp"

# socket connects
@socketio.on("connect")
def connected_successfully():
    path = os.getcwd() 
    # prints parent directory
    parent = str(os.path.abspath(os.path.join(path, os.pardir)))
    submit_folder_path = parent+"\\public\\archive\\Submit"
    print(submit_folder_path)
    socketio.emit("submit_path", submit_folder_path)
    print("connected successfully")
# disconnects server
@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected: ')

@socketio.on('file_import')
def first_time_setup(data):
    selected_class = data["class"]
    temp_path = "../public/archive/Temp/"+str(selected_class)+"/"
    shutil.rmtree(temp_path, ignore_errors=True)
    os.mkdir(temp_path)
    print("initiated class "+str(data["class"]))

@socketio.on("initiate-all")
def initiate_all():
    for selected_class in range(0, num_classes):
        temp_path = "../public/archive/Temp/"+str(selected_class)+"/"
        shutil.rmtree(temp_path, ignore_errors=True)
        os.mkdir(temp_path)
        print("ending class_initaition for "+str(selected_class))

@socketio.on("view_image")
def view_master(selected_class):
    working_dr = "../public/archive/Temp/"+str(selected_class)+"/"
    names_modified = os.listdir(working_dr)
    if len(names_modified)<60:
        socketio.emit("view_image", random.sample(names_modified, len(names_modified)))
    else:
        socketio.emit("view_image", random.sample(names_modified, 60))

def submit_data_maker(selected_class, submit_train, submit_valid, splitting_ratio):
            working_dr = "../public/archive/Temp/"+str(selected_class)+"/"
            train_dr = "../public/archive/Train/"+str(selected_class)+"/"
            final_name = []
            final_paths = []

            class_submit = ""
            os.mkdir(submit_valid+str(selected_class)+"/")
            os.mkdir(submit_train+str(selected_class)+"/")

            print("entering class "+str(selected_class))
            names_original = os.listdir(train_dr)
            # progress indication
            # socketio.emit("progress", {"progress": selected_class*100/43})
            path_original = list(map(lambda x : train_dr+str(x), names_original ))
            if os.path.exists(working_dr):
                names_modified = os.listdir(working_dr)
                path_modified = list(map(lambda x : working_dr+str(x), names_modified ))
                final_paths = path_modified+path_original
                final_name = names_modified+names_original
            else:
                final_name = names_original
                final_paths = path_original

            for path, name in zip(final_paths, final_name):
                random_number = random.uniform(0, 1)
                if random_number<splitting_ratio:
                    class_submit = submit_valid+str(selected_class)+"/"
                else :
                    class_submit = submit_train+str(selected_class)+"/"
                img = Image.open(path)
                img.save(class_submit+name)

            print("exiting class "+str(selected_class))

@socketio.on("submit_data")
def ml_runner(data):
    start_time = time.time()

    splitting_ratio = data["splitting_ratio"]
    print(splitting_ratio)
    print("entered ml_runner")
    submit_dr = "../public/archive/Submit/"
    shutil.rmtree(submit_dr, ignore_errors=True)
    os.mkdir(submit_dr) 
    submit_train = submit_dr+"train/"
    submit_valid = submit_dr+"validation/"
    os.mkdir(submit_train)
    os.mkdir(submit_valid)
    threads = []
    for selected_class in range(0, num_classes):
        t = threading.Thread(target=submit_data_maker, args=(selected_class, submit_train, submit_valid, splitting_ratio,))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()

    elapsed_time = time.time() - start_time
    print("total time taken: " + str(elapsed_time) + " second(s)")

@socketio.on("result_setup")
def result_master():
    file_path = "new_file.csv"
    data_to_send = []
    y_pred, y_true = labels_Pred(file_path)
    for caller in augment_store:
        data_to_send.append(caller(y_true, y_pred))
    socketio.emit("result_array", data_to_send)

@socketio.on("csv_data")
def csv_data(data):
    print("data reading")
    information = data["data"]
    file_info = data["fileInfo"]
    # print(information)
    # print(file_info)
    with open("new_file.csv","w+") as my_csv:
        csvWriter = csv.writer(my_csv,delimiter=',')
        csvWriter.writerows(information)
    file_path = "new_file.csv"
    data_to_send = []
    y_pred, y_true = labels_Pred(file_path)
    # print(y_pred)
    # print("GAAAP")
    # print(y_true)
    for caller in augment_store:
        data_to_send.append(caller(y_true, y_pred))
    print(data_to_send[0])
    # data_to_send = int(data_to_send)
    confusion = []
    for row in Confusion_Matrix(y_true, y_pred):
        n_row = []
        for num in row:
            n_row.append(int(num))
        confusion.append(n_row)
    print(confusion)
    accuracy = (data_to_send[2])
    precision = (data_to_send[3])
    f_one = (data_to_send[4])
    recall = (data_to_send[5])
    report = data_to_send[6]

    socketio.emit("result_array", {"confusion":confusion,
        "data_dictionary": data_to_send[1],
        "accuracy": accuracy,
        "precision":precision,
        "f_one":f_one,
        "recall":recall,
        "report": report
    })
    print(report)
    print("nice")
    
# images received to apply operations
@socketio.on("apply_operations")
def images_received(apply_operations_data):
    print("connected successfully to APPLY_OPERATIONS")
    # manipulation_data is a dictionary as follows
    # for 1st manipulation data we have these
    # param_1 : includes value of parameter in the appropriate range
    # prob_1 : is the probability of images on which param 1 is applied
    # if parameter is not applied then that parameter should be marked 0 both param_i and prob_i
    # images_data = apply_operations_data["images"]
    manipulation_data = apply_operations_data["operations"]
    selected_class = apply_operations_data["class"]
    print(manipulation_data)
    # print(str(len(images_data)) + " images received to process "+str(type(images_data))+ " "+str(type(images_data[0])))
    working_dr = "../public/archive/Temp/"+str(selected_class)+"/"
    train_dr = "../public/archive/Train/"+str(selected_class)+"/"
    names_original = os.listdir(train_dr)
    path_original = list(map(lambda x : train_dr+str(x), names_original ))
    names_modified = os.listdir(working_dr)
    path_modified = list(map(lambda x : working_dr+str(x), names_modified ))
    # Holder Lists to store information about images to be saved in temp folder
    save_images_file = []
    save_images_name = []
    print("original dataset length is "+str(len(names_original))+", and temp dataset length is "+str(len(names_modified)))
    msg_sent = False

    # First Reading From Original Dataset
    for i in range(0, len(names_original)):
        file_path = path_original[i]
        file_name = names_original[i]
        image = Image.open(file_path)
        img = np.array(image)
        img = rotate_image(image=img, factor=0)
        modified=False

        # Applying operation on Original Dataset
        for i in range(0, number_operations):
            random_number = random.uniform(0, 1)
            if (manipulation_data["prob_"+str(i)]>=random_number):
                if not modified:
                    print("modification occurred")
                modified = True
                img = function_store[i](image= img, factor= manipulation_data["param_"+str(i)])
        
        # Operations to do if Modification occurs
        if modified:
            pil_img = Image.fromarray((img * 255).astype(np.uint8))
            save_images_file.append(pil_img)
            save_images_name.append("m_"+file_name)
    print("now reading temp data")
    # Second Reading From Temp DataSet
    for i in range(0, len(names_modified)):
        file_path = path_modified[i]
        file_name = names_modified[i]
        # saving file regardless of outcome
        image = Image.open(file_path)
        save_images_name.append(file_name)
        save_images_file.append(image)
        img = np.array(image)
        img = rotate_image(image=img, factor=0)
        modified=False

        # Applying operation on Original Dataset
        for i in range(0, number_operations):
            random_number = random.uniform(0, 1)
            if (manipulation_data["prob_"+str(i)]>=random_number):
                if not modified:
                    print("modification occurred")
                modified = True
                img = function_store[i](image= img, factor= manipulation_data["param_"+str(i)])
        
        # Operations to do if Modification occurs
        if modified:
            pil_img = Image.fromarray((img * 255).astype(np.uint8))
            save_images_file.append(pil_img)
            save_images_name.append("m_"+file_name)
    
    # Deleting all previous contents of temp/selected_class directory and preparing it to write
    shutil.rmtree(working_dr, ignore_errors=True)
    os.mkdir(working_dr)
    for i in range(0,len(save_images_file)):
        save_images_file[i].save(working_dr+save_images_name[i])
    # send file names (not paths) to frontend of only modified files
    if not msg_sent:
        socketio.emit("processed_images", save_images_name)
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

    # for name in final_names:
    #     image = Image.open(name)
    #     img = np.array(image)
    #     img = rotate_image(image =img, factor=0)
    #     modified = False
        
    #     # operations started on single image
    #     for i in range(0, number_operations):
    #         random_number = random.uniform(0, 1)
    #         if (manipulation_data["prob_"+str(i)]>=random_number):
    #             if not modified:
    #                 print("modification occurred")
    #             modified = True
    #             img = function_store[i](image= img, factor= manipulation_data["param_"+str(i)])
    
    #     # convert array to pil image
    #     pil_img = Image.fromarray((img * 255).astype(np.uint8))

    #     # save pil image in computer
    #     # pil_img.save(working_dr+"/"+str(count)+".png", "png")
    #     if modified:
    #         super_paths.append(name)
    #         processed_data.append(pil_img)  
    #     print("images processed no. of imgs "+str(len(processed_data)))