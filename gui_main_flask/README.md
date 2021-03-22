### Backend in flask and flask_socketio for a deep learning model

Frontend: gui_main in React - [Link to repository](https://github.com/ankur-mitt/gui_main)

To setup follow these steps (windows):
1. setup your virtual python environment
2. activate virtual environment
3. install requirements
4. run server

```
python -m venv env
env/Scripts/activate
pip install -r requirements.txt
python main.py
```
## Notes
gui_main_flask
gui_main
archive   (this holds all images in dataset)
### These 3 should be in same Folder 
#### The archive folder is folder corresponding to archive.zip
archive should have directory Temp with Temp having further sub-directories 01, 02, 03 etc for different Classes.
It doesn't matter if Temp is empty or not
For hot reload of the server:

```
nodemon --exec ./env/Scripts/python.exe main.py
```
