import { configureStore } from "@reduxjs/toolkit";
import listUserReducer from "./slices/userSlice";
import authReducer from "./slices/auth"; 
import presenterReducer from "./slices/presenterSlice";
import organizerReducer from "./slices/organizerSlice";
import eventReducer from "./slices/eventSlice";
import activityReducer from "./slices/activitySlice";
const env = import.meta.env.NODE_ENV;

const store = configureStore({
  reducer: {
    listUser: listUserReducer,
    auth: authReducer, 
    presenters: presenterReducer,
    organizers: organizerReducer,
    events: eventReducer,
    activities: activityReducer,
  },
  devTools: env !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
