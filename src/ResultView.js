import React from "react";
import {Grid, Paper, Box, Button, Typography, Accordion, AccordionSummary, AccordionDetails} from "@material-ui/core";
import {ExpandMoreSharp} from "@material-ui/icons";
// imports for backend
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";
// charts and graphics imports
import CSVReader from "react-csv-reader";
import {Radar} from "@reactchartjs/react-chart.js";
import {XYPlot, XAxis, YAxis, HeatmapSeries, VerticalBarSeries} from "react-vis";

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL, {transports: ['websocket'], upgrade: false});
// global state values
let [accuracyScore, precisionScore, f1Score, recallScore] = [0.5, 0.5, 0.5, 0.5];   // garbage values
let numClasses = 0;
let dataDictionary = {};
let confusionMatrix = [[0.5]];
let classificationReport = "";

// shows overall performance
function OverallPerformanceComponent({accuracyScore, precisionScore, f1Score, recallScore}) {
    const data = {
        labels: ["Accuracy", "Precision", "F1", "Recall"],
        datasets: [
            {
                label: "Score Value",
                data: [accuracyScore, precisionScore, f1Score, recallScore],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };
    const options = {
        scale: {
            ticks: {beginAtZero: false},
        },
    };
    return (
        <React.Fragment>
            <Typography align="center" variant="h6" gutterBottom>Overall Performance</Typography>
            <Radar data={data} options={options}/>
        </React.Fragment>
    );
}

// shows bar graph
function BarGraphComponent({labels, values, heading}) {
    let data = [], min = values[0], max = values[0];
    for (let label in labels) {
        data.push({x: label, y: values[label]});
        min = Math.min(min, values[label]);
        max = Math.max(max, values[label]);
    }

    return (
        <React.Fragment>
            <Typography align="center" variant="h6" gutterBottom>{heading}</Typography>
            <XYPlot
                xType="ordinal"
                width={1050}
                height={300}
                yDomain={[min, max]}
            >
                <VerticalBarSeries data={data}/>
                <XAxis/>
                <YAxis/>
            </XYPlot>
        </React.Fragment>
    );
}

// show confusion matrix
function ConfusionMatrixComponent({confusionMatrix, numClasses}) {
    let data = [];
    for (let i = 0; i < numClasses; ++i) {
        for (let j = 0; j < numClasses; ++j) {
            data.push({x: i, y: j, color: Math.pow(confusionMatrix[i][j], 0.20)});
        }
    }
    // console.log(data);
    /*
    let alphabet = [];
    for (let i = 0; i < numClasses; ++i) {
        alphabet.push(i.toString());
    }

    console.log(confusionMatrix);
    const data = alphabet.reduce((acc, letter1, idx) => {
        return acc.concat(
            alphabet.map((letter2, jdx) => ({
                x: `${letter1}`,
                y: `${letter2}`,
                color: confusionMatrix[idx][jdx]
                // color: (idx + jdx) % Math.floor(jdx / idx) || idx
            }))
        );
    }, []);
    const {min, max} = data.reduce(
        (acc, row) => ({
            min: Math.min(acc.min, row.color),
            max: Math.max(acc.max, row.color)
        }),
        {min: Infinity, max: -Infinity}
    );
    // const exampleColorScale = scaleLinear().domain([min, (min + max) / 2, max]).range(['orange', 'white', 'cyan']);

    <XYPlot
            xType="ordinal"
            xDomain={alphabet.map(letter => `${letter}1`)}
            yType="ordinal"
            yDomain={alphabet.map(letter => `${letter}2`).reverse()}
            margin={50}
            width={500}
            height={500}
        >
            <XAxis orientation="top"/>
            <YAxis/>
            <HeatmapSeries
                colorType="literal"
                style={{
                    stroke: 'white',
                    strokeWidth: '2px',
                    rectStyle: {
                        rx: 10,
                        ry: 10
                    }
                }}
                className="heatmap-series-example"
                data={data}
            />
            <LabelSeries
                style={{pointerEvents: 'none'}}
                data={data}
                labelAnchorX="middle"
                labelAnchorY="baseline"
            />
        </XYPlot>
     */

    return (
        <React.Fragment>
            <Typography align="center" variant="h6" gutterBottom>Confusion Matrix</Typography>
            <Grid container>
                <XYPlot width={1000} height={1000}>
                    <XAxis orientation="top"/>
                    <YAxis/>
                    <HeatmapSeries
                        className="confusion-matrix"
                        colorRange={['aliceblue', 'orangered']}
                        data={data}
                        style={{
                            stroke: 'white',
                            strokeWidth: '2px',
                            rectStyle: {
                                rx: 15,
                                ry: 15
                            }
                        }}
                    />
                </XYPlot>
            </Grid>
        </React.Fragment>
    );
}

function ResultView() {
    // react states
    const [showOverallPerformance, setShowOverallPerformance] = React.useState(false);
    const [showConfusionMatrix, setShowConfusionMatrix] = React.useState(false);
    const [showBarGraphs, setShowBarGraphs] = React.useState(false);
    const [showClassificationReport, setShowClassificationReport] = React.useState(false);

    if (!main_socket.connected) {
        main_socket.connect()
    }
    main_socket.on("result_array", data => {
        numClasses = 43;
        [accuracyScore, precisionScore, f1Score, recallScore] = [data["accuracy"], data["precision"], data["f_one"], data["recall"]];
        confusionMatrix = data["confusion"];
        dataDictionary = data["data_dictionary"];
        classificationReport = data["report"];
        setShowOverallPerformance(true);
        setShowBarGraphs(true);
        setShowConfusionMatrix(true);
        setShowClassificationReport(true);
    });

    return (
        <React.Fragment>
            <span style={{display: "none"}}>
                    <CSVReader inputId="select-csv-input" onFileLoaded={(data, fileInfo) => {
                        main_socket.emit("csv_data", {"data": data, "fileInfo": fileInfo});
                    }}/>
            </span>
            <Paper variant="outlined">
                <Box margin={1}>
                    <Button onClick={() => document.getElementById("select-csv-input").click()} variant="outlined">
                        Select CSV
                    </Button>
                </Box>

                {showOverallPerformance && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreSharp/>}
                        aria-controls="-content"
                        id="-header"
                    >
                        <Typography>Complete Overlook</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <OverallPerformanceComponent
                                    accuracyScore={accuracyScore}
                                    precisionScore={precisionScore}
                                    f1Score={f1Score}
                                    recallScore={recallScore}
                                />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>}

                {showConfusionMatrix && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreSharp/>}
                        aria-controls="-content"
                        id="-header"
                    >
                        <Typography>Confusion Matrix</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ConfusionMatrixComponent
                            confusionMatrix={confusionMatrix}
                            numClasses={numClasses}
                        />
                    </AccordionDetails>
                </Accordion>}

                {showBarGraphs && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreSharp/>}
                        aria-controls="-content"
                        id="-header"
                    >
                        <Typography>Detailed Results</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container alignItems="center" spacing={2}>
                            {[["precision", "Precision Values"],
                                ["fscore", "F1 Scores"],
                                ["recall", "Recall Scores"],
                                ["support", "Support Values"]].map((param, index) => {
                                return (
                                    <Grid item xs={12} key={index}>
                                        <BarGraphComponent
                                            labels={dataDictionary["class_number"]}
                                            values={dataDictionary[param[0]]}
                                            heading={`Class-wise ${param[1]}`}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </AccordionDetails>
                </Accordion>}

                {showClassificationReport && <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreSharp/>}
                        aria-controls="-content"
                        id="-header"
                    >
                        <Typography>Classification Report</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="h6" align="center" gutterBottom>Classification Report</Typography>
                        <Typography variant="body1" align="center" style={{whiteSpace: "pre-wrap"}}>
                            {classificationReport}
                        </Typography>
                    </AccordionDetails>
                </Accordion>}

            </Paper>
        </React.Fragment>
    );
}

export default ResultView;
