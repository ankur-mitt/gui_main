# To Start
1. Open 2 terminals one in gui_main folder
2. In first terminal type: yarn start
3. In 2nd terminal type cd gui_main_flask
4. then in 2nd terminal activate the environment.
5. now in the 2nd terminal with activated environment type nodemon main.py
    Once both terminal have started The website is now ready

# To use Augmentation Operations
0. Click on Dataset button
1. For first time use press initiate all.
2. For each class you want to apply operation on do the following
    2.1 For example we choose class i from the drop down menu. Initialize it if you dont want augmented images from previous sessions
    2.2 Set parameter values and choose probability. This probability signifies the probability that a given operation will be applied  on image.
    2.3 Once you have choosen you want to apply on image you can press Apply Operations
    2.4 If the number of augmented images is relatively small then the augmented images will be shown in the grid.
    2.5 If they are not shown on grid (due to page reload), then press preview images to see randomly selected 60 augmented images from the selected class.
    2.6 Once dataset is updated you can now perform more operations on this new dataset (or new updated class). if you are satisfied with your preview then you can begin augmenting next class
3. Once You are done augmenting all classes click on Submit Dataset.
4. Choose Validation Split. If choosen 0.3 then 30% of all images would go to validation dataset. Click Confirm
5. You will then be shown the location of the Folder where updated dataset is located.
6. The name of this dataset would be submit and its format is as follows:
    Submit
        train
            0
            1
            ...
        validation
            0
            1
            ...
7. This Operation takes about 3-4 minutes to compile.

# To Use Results Operations