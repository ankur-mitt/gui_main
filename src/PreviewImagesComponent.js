import React from "react";
import {Box, GridList, GridListTile, Paper, Typography} from "@material-ui/core";

function PreviewImagesComponent({tileData}) {
    return (
        <React.Fragment>
            <Paper variant="outlined" style={{maxHeight: "91vh", overflowY: "scroll"}}>
                <Box padding={2}>
                    <Typography variant="h6" color="secondary" style={{padding: "0.5rem"}}>
                        Preview images to be added
                    </Typography>
                    <GridList cols={6} cellHeight={100}>
                        {tileData.map((tile, index) =>
                            <GridListTile key={index} cols={1} style={{padding: "0.5rem"}}>
                                <img src={tile.src} /*"archive/Temp/1/00001_00000_00000.png"*/ alt={tile.alt}/>
                            </GridListTile>
                        )}
                    </GridList>
                </Box>
            </Paper>
        </React.Fragment>
    );
}

export default PreviewImagesComponent;
