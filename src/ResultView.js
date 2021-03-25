import React from "react";
import {Paper, Button} from "@material-ui/core";
// imports for backend
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";
// charts and graphics imports
import CSVReader from "react-csv-reader";
import {Radar} from "@reactchartjs/react-chart.js";
import {XYPlot, XAxis, YAxis, HeatmapSeries, LabelSeries} from "react-vis";

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL, {transports: ['websocket'], upgrade: false});
let [accuracyScore, precisionScore, f1Score, recallScore] = [0.6, 0.7, 0.3, 0.9];   // todo

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
            ticks: { beginAtZero: true },
        },
    };
    return (<Radar data={data} options={options} />);
}

function ConfusionMatrixComponent() {
    const classesNames = ["class1", "class2", "class3"];
    const data = classesNames.reduce((acc, letter1, idx) => {
        return acc.concat(
            classesNames.map((letter2, jdx) => ({
                x: `${letter1}1`,
                y: `${letter2}2`,
                color: (idx + jdx) % Math.floor(jdx / idx) || idx
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

    return (
        <XYPlot
            xType="ordinal"
            xDomain={classesNames.map(letter => `${letter}1`)}
            yType="ordinal"
            yDomain={classesNames.map(letter => `${letter}2`).reverse()}
            margin={50}
            width={500}
            height={500}
        >
            <XAxis orientation="top" />
            <YAxis />
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
                onValueMouseOver={v => this.setState({value: v})}
                onSeriesMouseOut={v => this.setState({value: false})}
            />
            <LabelSeries
                style={{pointerEvents: 'none'}}
                data={data}
                labelAnchorX="middle"
                labelAnchorY="baseline"
                getLabel={d => `${d.color}`}
            />
        </XYPlot>
    );
}

function ResultView() {
    if (!main_socket.connected) {
        main_socket.connect()
    }

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
                }}>Select CSV</Button>
            </Paper>
        </React.Fragment>
    );
}

export default ResultView;

/*
<OverallPerformanceComponent
                    accuracyScore={accuracyScore}
                    precisionScore={precisionScore}
                    f1Score={f1Score}
                    recallScore={recallScore}
                />
 */