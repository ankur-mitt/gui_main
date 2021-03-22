import React from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {Container, Grid, Box, AppBar, Toolbar, Typography} from "@material-ui/core";
import UserOptions from "./UserOptions";
import DatasetView from "./DatasetView";
import ResultView from "./ResultView";

function App() {
    return (
        <div className="app">
            <Container maxWidth="xl" disableGutters>
                <AppBar position="static" color="primary">
                    <Toolbar variant="dense" style={{justifyContent: 'center'}}>
                        <Typography variant="h5">
                            GUI to manipulate (add augmentation) and update images dataset
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Box padding={1}>
                    <Grid container spacing={1}>
                        <Router>
                            <Grid item xs={2}><UserOptions/></Grid>
                            <Grid item xs={10}>
                                <Switch>
                                    <Route path="/dataset"><DatasetView/></Route>
                                    <Route path="/result"><ResultView/></Route>
                                    <Router path="/"/>
                                </Switch>
                            </Grid>
                        </Router>
                    </Grid>
                </Box>
            </Container>
        </div>
    );
}

export default App;
