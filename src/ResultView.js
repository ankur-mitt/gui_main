import React from "react";
import {Paper, Button} from "@material-ui/core";
import CSVReader from "react-csv-reader";
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL, {transports: ['websocket'], upgrade: false});

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
