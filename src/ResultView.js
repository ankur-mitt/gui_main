import React from "react";
import {Paper, Button} from "@material-ui/core";
import {fileOpen} from "browser-fs-access";
async function csv_opener(){
    const blobs = await fileOpen({
        mimeTypes: ["csv/*"],
        extensions: [".csv"],
        multiple: false,
        description: "Select csv file"
    });
    console.log(blobs)
    const reader = new FileReader();
    let master;
    reader.onload = event => {master = event.target.result}
    // reader.readAsDataURL(blobs[index]);

}

function ResultView() {
    return (
        <React.Fragment>
            <Paper variant="outlined">
                <Button onClick={()=>{
                    csv_opener()
                }}>
                    Click Me
                </Button>

            </Paper>
        </React.Fragment>
    );
}

export default ResultView;
