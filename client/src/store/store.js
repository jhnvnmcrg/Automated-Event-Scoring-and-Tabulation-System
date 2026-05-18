import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventReducer from "./slices/eventSlice";
import scoreReducer from "./slices/scoreSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        events: eventReducer,
        scores: scoreReducer
    }
});
