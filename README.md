# GUI to augment images dataset and visualize ML model results

**Screenshots of the working application**
<table>
    <tr>
        <td><img src="/screenshots/Screenshot (1).png" alt="1" style="display: block; margin: auto;"></td>
        <td><img src="/screenshots/Screenshot (2).png" alt="2" style="display: block; margin: auto;"></td>
    </tr>
    <tr>
        <td><img src="/screenshots/Screenshot (3).png" alt="3" style="display: block; margin: auto;"></td>
        <td><img src="/screenshots/Screenshot (4).png" alt="4" style="display: block; margin: auto;"></td>
    </tr>
    <tr>
        <td><img src="/screenshots/Screenshot (5).png" alt="5" style="display: block; margin: auto;"></td>
        <td><img src="/screenshots/Screenshot (6).png" alt="6" style="display: block; margin: auto;"></td>
    </tr>
    <tr>
        <td><img src="/screenshots/Screenshot (7).png" alt="7" style="display: block; margin: auto;"></td>
        <td><img src="/screenshots/Screenshot (8).png" alt="8" style="display: block; margin: auto;"></td>
    </tr>
    <tr>
        <td><img src="/screenshots/Screenshot (9).png" alt="9" style="display: block; margin: auto;"></td>
        <td><img src="/screenshots/Screenshot (10).png" alt="10" style="display: block; margin: auto;"></td>
    </tr>
</table>

## To Start
1. Open 2 terminals one in gui_main folder
2. In first terminal type: yarn start
3. In 2nd terminal type cd gui_main_flask
4. then in 2nd terminal activate the environment.
5. now in the 2nd terminal with activated environment type nodemon main.py
    Once both terminal have started The website is now ready

## To use Augmentation Operations
1. Click on Dataset button
2. For first time use press initiate all.
3. For each class you want to apply operation on do the following
    1. For example we choose class i from the drop down menu. Initialize it if you dont want augmented images from previous sessions
    2. Set parameter values and choose probability. This probability signifies the probability that a given operation will be applied  on image.
    3. Once you have chosen you want to apply on image you can press Apply Operations
    4. If the number of augmented images is relatively small then the augmented images will be shown in the grid.
    5. If they are not shown on grid (due to page reload), then press preview images to see randomly selected 60 augmented images from the selected class.
    6. Once dataset is updated you can now perform more operations on this new dataset (or new updated class). if you are satisfied with your preview then you can begin augmenting next class
4. Once You are done augmenting all classes click on Submit Dataset.
5. Choose Validation Split. If chosen 0.3 then 30% of all images would go to validation dataset. Click Confirm
6. You will then be shown the location of the Folder where updated dataset is located.
7. The name of this dataset would be submit and its format is as follows:
    Submit
        train
        0
        1
        ...
        validation
        0
        1
        ...
8. This Operation takes about 3-4 minutes to complete.

## To Use Results Operations
1. CSV file to be upload: first row-> true labels, second row-> predicted labels
2. Result page displays:
    1. Confusion matrix: x-axis:true class and y-axis:predicted class
    2. Donut chart displaying percentage of different classes in actual and predicted dataset.
    3. Radar chart displaying average(macro) accuracy score, precision score, F1 score, recall score.
