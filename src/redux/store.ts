import { combineReducers } from "redux";
import { MovieReducer } from "./reducers";
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  movies: MovieReducer,
});

export const store = configureStore({ reducer: rootReducer });
