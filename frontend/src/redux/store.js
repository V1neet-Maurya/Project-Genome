import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./userSlice";
import projectReducer from "./projectSlice";
import taskReducer from "./taskSlice";
import issueReducer from "./issueSlice";
import teamReducer from "./teamSlice";
import dashboardReducer from "./dashboardSlice";
import documentReducer from "./documentSlice";
import notificationReducer from "./notificationSlice";
import activityReducer from "./activitySlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer,
    task: taskReducer,
    issue: issueReducer,
    team: teamReducer,
    dashboard: dashboardReducer,
    document: documentReducer,
    notification: notificationReducer,
    activity: activityReducer,
  },
});

export default store;