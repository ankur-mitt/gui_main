import React from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Slider,
    Grid,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress
} from "@material-ui/core";
import PreviewImagesComponent from "./PreviewImagesComponent";
import {PlayArrowSharp, BrushSharp, VisibilitySharp, CloudUploadSharp} from "@material-ui/icons";
// imports for backend connection setup
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL, {transports: ['websocket'], upgrade: false});

//  function_number is the number of functions or operations that we can apply on the image,
//  like noise, rotate, translate, zoom etc.
//  declare global variables
// default class value is = 0
let function_number = 4;
let probability_array = new Array(function_number).fill(0);
let value_array = new Array(function_number).fill(0);
let current_class = 0;
let masterTile = {};
for (let i = 0; i <= 44; ++i) {
    masterTile[i.toString()] = [];
}
let splitting_ratio = 0.3;

function handleApplyOperations() {
    // manipulation_data is a dictionary as follows
    //  for 1st manipulation data we have these
    //  param_1 : includes value of parameter in the appropriate range, also parameter can be anything even an list
    //  prob_1 : is the probability of images on which param 1 is applied
    //  if parameter is not applied then that parameter should be marked 0 both param_i and prob_i
    // refer functions to get idea about range of these functions
    // 0 : add_noise | 1: rotate_image | 2: translate | 3: zoom
    let name_list = masterTile[current_class].map(item => item["alt"]);
    // console.log("about to send data");
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
        // console.log("ready to send");
        main_socket.emit("apply_operations", {
            "images": name_list,
            "operations": manipulation_data,
            "class": current_class
        });
    }
    // console.log("data sent");
}

function ManipulationInputOptions({setTileData}) {
    const [classValue, setClassValue] = React.useState(0);

    return (
        <React.Fragment>
            <Grid item container xs={12} spacing={1}>
                <Grid item xs={12}>
                    <Typography color="textPrimary" variant="h6">Select Class</Typography>
                </Grid>
                <Grid item xs={6}>
                    <FormControl style={{minWidth: 250}}>
                        {/*<InputLabel id="select-class-label">Select Class</InputLabel>*/}
                        <Select
                            labelId="select-class-label"
                            id="select-class"
                            value={classValue}
                            onChange={event => {
                                setClassValue(event.target.value);
                                // console.log(event.target.value);
                                current_class = event.target.value;
                                setTileData(masterTile[current_class.toString()]);
                            }}
                        >
                            {Array(45).fill(0).map((temp, index) =>
                                <MenuItem value={index} key={index}>{index}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <ButtonGroup variant="outlined" size="small">
                        <Button title="initiate-single" startIcon={<PlayArrowSharp/>}
                                onClick={(event) => {
                                    event.preventDefault();
                                    main_socket.emit("file_import", {"class": current_class});
                                }}>
                            Initiate Class
                        </Button>
                        <Button title="initiate-all" startIcon={<PlayArrowSharp/>}
                                onClick={(event) => {
                                    event.preventDefault();
                                    main_socket.emit("initiate-all");
                                }}>
                            Initiate All
                        </Button>
                    </ButtonGroup>
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
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
                            onChange={(e, value) => {
                                probability_array[3] = value
                            }}
                            getAriaValueText={value => `${value * 100}%`}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

// loads the temp folder data,
// updates tile data with some randomly chosen images,
// only for the current_class
function handlePreviewImages(setTileData) {
    if (!main_socket.connected) {
        main_socket.connect();
    }
    main_socket.emit("view_image", current_class);
    main_socket.on("view_image", data => {
        // console.log(data);        
        let finalProcessedImagesData = data.map(item => {
            return {
                src: "archive/Temp/" + current_class.toString() + "/" + item,
                alt: "nothing"
            };
        });
        // console.log(finalProcessedImagesData)
        masterTile[current_class.toString()] = finalProcessedImagesData;
        setTileData(finalProcessedImagesData);
    });
}

function AugmentationOptionsComponent({setTileData, setSubmitDialogOpen}) {
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
                        <ManipulationInputOptions setTileData={setTileData}/>
                        <Grid item container xs={12} spacing={1}>
                            <Grid item xs={8}>
                                <ButtonGroup variant="contained">
                                    <Button
                                        title="apply-images"
                                        color="primary"
                                        startIcon={<BrushSharp/>}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleApplyOperations();
                                        }}
                                    >
                                        Apply Operations
                                    </Button>
                                    <Button
                                        title="preview-images"
                                        color="default"
                                        startIcon={<VisibilitySharp/>}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            // load the temp data: some images randomly
                                            handlePreviewImages(setTileData);
                                        }}
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
                                    onClick={(event) => {
                                        event.preventDefault();
                                        // show the submission confirmation dialog
                                        setSubmitDialogOpen(true);
                                    }}
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
    const [tileData, setTileData] = React.useState([]);
    const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
    const [makingSubmissionDataset, setMakingSubmissionDataset] = React.useState(false);
    const [submissionFolderPath, setSubmissionFolderPath] = React.useState("");
    const [showLinearProgress, setShowLinerProgress] = React.useState(true);

    if (main_socket.disconnected) {
        main_socket.connect();
    }
    main_socket.on("submit_path", submit_path => setSubmissionFolderPath(submit_path));

    return (
        <React.Fragment>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    <AugmentationOptionsComponent setTileData={setTileData} setSubmitDialogOpen={setSubmitDialogOpen}/>
                </Grid>
                <Grid item xs={6}>
                    <PreviewImagesComponent tileData={tileData}/>
                </Grid>
            </Grid>
            {submitDialogOpen && (
                <Dialog onClose={() => setSubmitDialogOpen(false)} aria-labelledby="submission-dialog"
                        open={submitDialogOpen} maxWidth="sm" fullWidth>
                    <DialogTitle id="submission-dialog-title">Confirm Submission</DialogTitle>
                    <DialogContent>
                        <Typography id="splitting-ratio-title" component={InputLabel} gutterBottom>
                            Splitting Ratio
                        </Typography>
                        <Slider defaultValue={splitting_ratio} min={0} max={1} step={0.05} marks
                                aria-labelledby="splitting-ratio-title"
                                valueLabelDisplay="auto"
                                onChange={(e, value) => {
                                    splitting_ratio = value;
                                }}
                                getAriaValueText={value => `${value * 100}%`}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus color="primary" onClick={event => {
                            event.preventDefault();
                            if (main_socket.disconnected) {
                                main_socket.connect();
                            }
                            // make the submit folder and populate with original and temp data
                            main_socket.emit("submit_data", {"splitting_ratio": splitting_ratio});
                            setSubmitDialogOpen(false);
                            setMakingSubmissionDataset(true);
                            setTimeout(() => setShowLinerProgress(false), 10000);
                        }}>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            {makingSubmissionDataset && (
                <Dialog open={makingSubmissionDataset} maxWidth="sm" fullWidth onClose={() =>
                    setMakingSubmissionDataset(false)
                }>
                    <DialogTitle>Creating Final Dataset</DialogTitle>
                    <DialogContent>
                        {showLinearProgress && <LinearProgress/>}
                        <Typography variant="body2" color="textSecondary" style={{paddingTop: "1rem"}}>
                            {"Your dataset is being created at:\n"+submissionFolderPath.toString()}
                        </Typography>
                    </DialogContent>
                </Dialog>
            )}
        </React.Fragment>
    );
}

export default DatasetView;
