from sklearn.metrics import confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

from sklearn.metrics import precision_recall_fscore_support
from sklearn.metrics import accuracy_score
from sklearn.metrics import precision_score
from sklearn.metrics import f1_score
from sklearn.metrics import recall_score
from sklearn.metrics import classification_report

from csv import reader
# open file in read mode
filename="your_file.csv"


def labels_Pred(filename):
  y=[]
  with open(filename, 'r') as read_obj:
      # pass the file object to reader() to get the reader object
      csv_reader = reader(read_obj)
      # Iterate over each row in the csv using reader object
      for row in csv_reader:
          # row variable is a list that represents a row in csv
          y.append(row)
          

  y_true=y[0]
  y_pred=y[1]
 
  for i in range(0, len(y_true)): 
        y_true[i] = int(y_true[i])
        y_pred[i] = int(y_pred[i])
  
  return y_pred, y_true

# y_pred, y_true = labels_Pred(filename)
# print(y_pred,y_true)

classes = { 0:'Speed limit (20km/h)',
            1:'Speed limit (30km/h)', 
            2:'Speed limit (50km/h)', 
            3:'Speed limit (60km/h)', 
            4:'Speed limit (70km/h)', 
            5:'Speed limit (80km/h)', 
            6:'End of speed limit (80km/h)', 
            7:'Speed limit (100km/h)', 
            8:'Speed limit (120km/h)', 
            9:'No passing', 
            10:'No passing veh over 3.5 tons', 
            11:'Right-of-way at intersection', 
            12:'Priority road', 
            13:'Yield', 
            14:'Stop', 
            15:'No vehicles', 
            16:'Veh > 3.5 tons prohibited', 
            17:'No entry', 
            18:'General caution', 
            19:'Dangerous curve left', 
            20:'Dangerous curve right', 
            21:'Double curve', 
            22:'Bumpy road', 
            23:'Slippery road', 
            24:'Road narrows on the right', 
            25:'Road work', 
            26:'Traffic signals', 
            27:'Pedestrians', 
            28:'Children crossing', 
            29:'Bicycles crossing', 
            30:'Beware of ice/snow',
            31:'Wild animals crossing', 
            32:'End speed + passing limits', 
            33:'Turn right ahead', 
            34:'Turn left ahead', 
            35:'Ahead only', 
            36:'Go straight or right', 
            37:'Go straight or left', 
            38:'Keep right', 
            39:'Keep left', 
            40:'Roundabout mandatory', 
            41:'End of no passing', 
            42:'End no passing veh > 3.5 tons' 
           }

def Confusion_Matrix(y_true, y_pred , classes):

  cf = confusion_matrix(y_true, y_pred)
  # df_cm = pd.DataFrame(cf, index = classes,  columns = classes)
  # plt.figure(figsize = (20,20))
  # sns.heatmap(df_cm, annot=True)
  cf = cf.tolist()
  return cf


def data_dictonary(y_true, y_pred):

    temp = precision_recall_fscore_support(y_true, y_pred, average=None)
    data_to_return = []
    for i in range(temp[0].shape[0]):
    data_to_return.append({
        "class_number": i,
        "class_name" : classes[i],
        "precision": temp[0][i],
        "recall": temp[1][i],
        "fscore" : temp[2][i],
        "support" : temp[3][i]
    })
    return data_to_return



def Accuracy_score(y_true, y_pred):
  return accuracy_score(y_true, y_pred)
# print(Accuracy_score(y_true, y_pred))


def Precssion_score(y_true, y_pred):
  return precision_score(y_true, y_pred, average='macro')
# print(Precssion_score(y_true, y_pred))


def F1_score(y_true, y_pred):
  return f1_score(y_true, y_pred, average='macro')
# print(F1_score(y_true, y_pred))


def Recall_score(y_true, y_pred):
  return recall_score(y_true, y_pred, average='macro')
# print(Recall_score(y_true, y_pred))


def report(y_true, y_pred):
  return classification_report(y_true, y_pred)
