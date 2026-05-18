import { configureStore } from "@reduxjs/toolkit";

import messageReducer from './MessageSlice';
const store = configureStore({
  reducer:{
    message: messageReducer
  }
})

export default store;