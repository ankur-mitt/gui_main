import React from "react";
import {AssessmentSharp, PermMediaSharp} from "@material-ui/icons";
import {Link, useLocation} from "react-router-dom";
import {List, ListItem, ListItemIcon, ListItemText, ListSubheader, Paper} from "@material-ui/core";

function UserOptions() {
    const routes = [
        {
            to: "/dataset",
            primary: "Dataset",
            secondary: "Manipulate and update dataset for the model.",
            icon: AssessmentSharp
        },
        {
            to: "/result",
            primary: "Result",
            secondary: "See results and insights of the deep learning model.",
            icon: PermMediaSharp
        }
    ];
    const [activePage, setActivePage] = React.useState(useLocation().pathname);

    return (
        <React.Fragment>
            <Paper variant="outlined">
                <List component="nav" subheader={<ListSubheader>Available options</ListSubheader>}>
                    {routes.map((route, index) =>
                        <ListItem
                            button
                            component={Link}
                            key={index}
                            to={route.to}
                            selected={activePage === route.to}
                            onClick={() => {
                                setActivePage(route.to);
                            }}
                        >
                            <ListItemIcon>
                                <route.icon/>
                            </ListItemIcon>
                            <ListItemText primary={route.primary} secondary={route.secondary}/>
                        </ListItem>
                    )}
                </List>
            </Paper>
        </React.Fragment>
    );
}

export default UserOptions;
