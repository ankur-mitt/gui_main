import React from "react";
import {Paper, Button} from "@material-ui/core";
import {io} from "socket.io-client";
import {backendURL} from "./backendConfig";

// Starting Main Socket connection it will be restarted if it is disconnected and it is needed
let main_socket = io(backendURL, {transports: ['websocket'], upgrade: false});

async function csv_opener(){
    if (!main_socket.connected) {
        main_socket.connect()
    }
    main_socket.emit("result_setup")
}

function ResultView() {
    if (!main_socket.connected) {
        main_socket.connect()
    }
    main_socket.on("result_array", data => {
        console.log(data)
    })
    return (
        <React.Fragment>
            <Paper variant="outlined">
                <Button onClick={()=>{
                    csv_opener()
                }}>
                    Name
                </Button>

            </Paper>
        </React.Fragment>
    );
}

export default ResultView;
