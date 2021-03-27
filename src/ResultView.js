import React from "react";
import {Paper, Button} from "@material-ui/core";
// imports for backend
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";
// charts and graphics imports
import CSVReader from "react-csv-reader";
import {Radar} from "@reactchartjs/react-chart.js";
// import {XYPlot, XAxis, YAxis, HeatmapSeries, LabelSeries} from "react-vis";

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL, {transports: ['websocket'], upgrade: false});
let [accuracyScore, precisionScore, f1Score, recallScore] = [0.5, 0.5, 0.5, 0.5];

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
            ticks: {beginAtZero: true},
        },
    };
    return (<Radar data={data} options={options}/>);
}

function ResultView() {
    const [showOverallPerformance, setShowOverallPerformance] = React.useState(false);
    if (!main_socket.connected) {
        main_socket.connect()
    }
    main_socket.on("result_array", data => {
        accuracyScore = data["accuracy"];
        precisionScore = data["precision"];
        f1Score = data["f_one"];
        recallScore = data["recall"];
        console.log("data received: ", data);
    });

    return (
        <React.Fragment>
            <Paper variant="outlined">
                <span style={{display: "none"}}>
                    <CSVReader inputId="select-csv-input" onFileLoaded={(data, fileInfo) => {
                        console.log(data, fileInfo);
                        main_socket.emit("csv_data", {"data": data, "fileInfo": fileInfo});
                    }}/>
                </span>
                <Button onClick={() => {
                    document.getElementById("select-csv-input").click();
                    setShowOverallPerformance(true);
                }}>Select CSV</Button>
                {showOverallPerformance && <OverallPerformanceComponent
                    accuracyScore={accuracyScore}
                    precisionScore={precisionScore}
                    f1Score={f1Score}
                    recallScore={recallScore}
                />}
            </Paper>
        </React.Fragment>
    );
}

export default ResultView;
