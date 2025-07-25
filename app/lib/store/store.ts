import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./searchSlice";
import assistantReducer from "./assistantSlice";
// Import other reducers here if you have them

export const makeStore = () => {
    return configureStore({
        reducer: {
            search: searchReducer,
            assistant: assistantReducer,
            // Add other reducers here
        },
    });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
