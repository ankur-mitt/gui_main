import React from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Slider,
    Grid,
    // Input,
    InputLabel,
    // InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Paper,
    Typography
} from "@material-ui/core";
import {fileOpen} from "browser-fs-access";
import PreviewImagesComponent from "./PreviewImagesComponent";
import {AddPhotoAlternateSharp, VisibilitySharp, CloudUploadSharp} from "@material-ui/icons";
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
//  function_number is the number of functions or operations that we can apply on the image, like noise, rotate, translate, zoom etc.
let function_number = 4;
let probability_array = new Array(function_number).fill(0);
let value_array = new Array(function_number).fill(0);
let current_class = 1
let masterTile = {
    "0": [],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
    "11": [],
    "12": [],
    "13": [],
    "14": [],
    "15": [],
    "16": [],
    "17": [],
    "18": [],
    "19": [],
    "20": [],
    "21": [],
    "22": [],
    "23": [],
    "24": [],
    "25": [],
    "26": [],
    "27": [],
    "28": [],
    "29": [],
    "30": [],
    "31": [],
    "32": [],
    "33": [],
    "34": [],
    "35": [],
    "36": [],
    "37": [],
    "38": [],
    "39": [],
    "40": [],
    "41": [],
    "42": [],
    "43": [],
    "44": [],
}

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL);

async function handleOpenAndReadFiles() {
    // get files from user
    // const blobs = await fileOpen({
    //     mimeTypes: ["image/*"],
    //     extensions: [".png", ".jpg", ".jpeg", ".bmp"],
    //     multiple: true,
    //     description: "Select ALL images"
    // });
    // console.log(blobs)
    // let tileData = [];

    // let name_list = blobs.map(item => item["name"])
    // tileData = name_list.map(item => {
    //     return {
    //         src: "archive/Train/"+current_class.toString()+"/"+item,
    //         alt: item
    //     }
    // })
    // read the selected files' data
    // for (let index = 0; index < blobs.length; ++index) {
    //     const reader = new FileReader();
    //     reader.onload = event =>{

    //         tileData.push({src: event.target.result, alt: blobs[index].name})
    //         name_list.push(blobs[index].name)
    //     }

    //     reader.readAsDataURL(blobs[index]);
    // }
    if (!main_socket.connected) {
        main_socket.connect()
    }
    main_socket.emit("file_import", {
        "class": current_class,
    })
    // masterTile[current_class.toString()] = tileData
    // setTimeout(5000)
    return {data: [], numFiles: []};
}

function handleSelectFiles(setTileData) {
    handleOpenAndReadFiles().then(result => {
        // will come here only if data was read successfully
        const stop = setInterval(() => {
            if (result.data.length === result.numFiles) {
                // setTileData(result.data);
                clearInterval(stop);
            }
        }, 10);
        // stop interval after 30s automatically - default
        setTimeout(() => clearInterval(stop), 30000);
    }).catch(reason => console.log(reason));
}

function handlePreviewImages(tileData) {
    // manipulation_data is a dictionary as follows
    //  for 1st manipulation data we have these
    //  param_1 : includes value of parameter in the appropriate range, also parameter can be anything even an list
    //  prob_1 : is the probability of images on which param 1 is applied
    //  if parameter is not applied then that parameter should be marked 0 both param_i and prob_i
    // refer functions to get idea about range of these functions
    // 0 : add_noise | 1: rotate_image | 2: translate | 3: zoom
            let name_list = masterTile[current_class].map(item => item["alt"])
            console.log("about to send data");
            let manipulation_data = {
                "param_0": value_array[0],
                "prob_0": probability_array[0],
                "param_1": value_array[1],
                "prob_1": probability_array[1],
                "param_2": value_array[2],
                "prob_2": probability_array[2],
                "param_3": value_array[3],
                "prob_3": probability_array[3],
            };
            if (!main_socket.connected) {
                main_socket.connect();
            }
            if (main_socket.connected) {
                console.log("ready to send");
                main_socket.emit("apply_operations", {"images":name_list,
                                                    "operations": manipulation_data,
                                                    "class":current_class});
            }
            console.log("data sent");
}

function ManipulationInputOptions({setTileData}) {
    const [classValue, setClassValue] = React.useState(1);

    return (
        <React.Fragment>
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography color="textPrimary" variant="h6">Select Class</Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormControl style={{minWidth: 250}}>
                        {/*<InputLabel id="select-class-label">Select Class</InputLabel>*/}
                        <Select
                            labelId="select-class-label"
                            id="select-class"
                            value={classValue}
                            onChange={event => {
                                setClassValue(event.target.value)
                                console.log(event.target.value)
                                current_class = event.target.value
                                try{
                                    setTileData(masterTile[current_class.toString()])
                                } catch(e)
                                {
                                    console.log("next "+e)
                                }
                            }}
                        >
                            {Array(45).fill(0).map((temp, index) =>
                                <MenuItem value={index} key={index}>{index}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography color="textPrimary" variant="h6">Translate</Typography>
                </Grid>
                <Grid item xs={5}>
                <Typography id="Translate-value" component={InputLabel}
                                gutterBottom>Length</Typography>
                <Slider defaultValue={0} min={0} max={20} step={1} marks
                            aria-labelledby="Translate-value"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                value_array[2] = value
                            }}
                            // track = "inverted"
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
                <Grid item xs={1}>
                </Grid>
                <Grid item xs={5}>
                    <Typography id="Translate-probability" component={InputLabel}
                                gutterBottom>Probability</Typography>
                    <Slider defaultValue={0} min={0} max={1} step={0.1} marks
                            aria-labelledby="Translate-probability"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                probability_array[2] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography color="textPrimary" variant="h6">Noise</Typography>
                </Grid>
                <Grid item xs={5}>
                <Typography id="noise-value" component={InputLabel}
                                gutterBottom>Value</Typography>
                    <Slider defaultValue={0} min={0} max={1} step={0.1} marks
                            aria-labelledby="noise-value"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                value_array[0] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
                <Grid item xs={1}>
                </Grid>
                <Grid item xs={5}>
                    <Typography id="noise-probability" component={InputLabel}
                                gutterBottom>Probability</Typography>
                    <Slider defaultValue={0} min={0} max={1} step={0.1} marks
                            aria-labelledby="noise-probability"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                probability_array[0] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography color="textPrimary" variant="h6">Rotate</Typography>
                </Grid>
                <Grid item xs={5}>
                <Typography id="rotate-value" component={InputLabel}
                                gutterBottom>Value</Typography>
                    <Slider defaultValue={0} min={0} max={360} step={15} marks
                            aria-labelledby="rotate-value"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                value_array[1] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
                <Grid item xs={1}>
                </Grid>
                <Grid item xs={5}>
                    <Typography id="rotate-probability" component={InputLabel}
                                gutterBottom>Probability</Typography>
                    <Slider defaultValue={0} min={0} max={1} step={0.1} marks
                            aria-labelledby="rotate-probability"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                probability_array[1] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
            </Grid>
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography color="textPrimary" variant="h6">Zoom</Typography>
                </Grid>
                <Grid item xs={5}>
                <Typography id="zoom-value" component={InputLabel}
                                gutterBottom>Amount</Typography>
                    <Slider defaultValue={0} min={0} max={2} step={0.1} marks
                            aria-labelledby="zoom-value"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                value_array[3] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
                <Grid item xs={1}>
                </Grid>
                <Grid item xs={5}>
                    <Typography id="zoom-probability" component={InputLabel}
                                gutterBottom>Probability</Typography>
                    <Slider defaultValue={0} min={0} max={1} step={0.1} marks
                            aria-labelledby="zoom-probability"
                            valueLabelDisplay="auto"
                            onChange = {(e, value) => {
                                probability_array[3] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

function AugmentationOptionsComponent({tileData, setTileData}) {
    // const [socket, ] = React.useState(io(backendURL));
    // let socket = io(backendURL)
    if (!main_socket.connected) {
        main_socket.connect()
    }
    return (
        <React.Fragment>
            <Paper variant="outlined">
                <Box padding={2}>
                    <Typography variant="h6" color="secondary" style={{padding: "0.5rem"}}>
                        Augmentation options
                    </Typography>
                    <Grid container spacing={3}>
                        <ManipulationInputOptions setTileData={setTileData} />
                        <Grid item container xs={12} spacing={1}>
                            <Grid item xs={8}>
                                <ButtonGroup variant="contained">
                                    <Button
                                        title="Load-files"
                                        color="default"
                                        startIcon={<AddPhotoAlternateSharp/>}
                                        onClick={()=> handleOpenAndReadFiles()}
                                    >
                                        Select Files
                                    </Button>
                                    <Button
                                        title="preview-images"
                                        color="primary"
                                        startIcon={<VisibilitySharp/>}
                                        onClick={() => handlePreviewImages(tileData)}
                                    >
                                        Preview Images
                                    </Button>
                                </ButtonGroup>
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    title="submit-dataset"
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<CloudUploadSharp/>}
                                >
                                    Submit Dataset
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </React.Fragment>
    );
}

function DatasetView() {
    // setup state variables
    // const [socket,] = React.useState(io(backendURL));   // main socket - to handle updates
    const [tileData, setTileData] = React.useState([]);
    if (!main_socket.connected) {
        main_socket.connect()
    }
    // register socket events
    main_socket.on("processed_images", processedImagesData => {
        console.log(processedImagesData);
        let finalProcessedImagesData = processedImagesData.map(item => {
            return {
                src: "archive/Temp/"+current_class.toString()+"/"+item,
                alt: "nothing"
            }
        })
        console.log(finalProcessedImagesData)
        masterTile[current_class.toString()] = finalProcessedImagesData
        setTileData(finalProcessedImagesData);  // update the component state with new 'tileData'
    });
    main_socket.on("load-images", data => {
        if (data=="complete") {
            console.log("recieved load-images")
            setTileData([{
                src: "logo192.png",
                alt: "Ready"
            }])
        }
    })

    return (
        <React.Fragment>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    <AugmentationOptionsComponent tileData={tileData} setTileData={setTileData}/>
                </Grid>
                <Grid item xs={6}>
                    <PreviewImagesComponent tileData={tileData}/>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default DatasetView;
