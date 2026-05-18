import { createSlice } from '@reduxjs/toolkit';

const initialState= {
  isOpen : false , 
  type: 'success',
  text : ''
};

export const MessageSlice =createSlice({
  name:"message",
  initialState,
  reducers:{
    showMessage: (state,action)=>{
      state.isOpen=true;
      state.type= action.payload.type;
      state.text = action.payload.text;
    },
    clearMessage: (state)=>{
      state.isOpen=false;
      state.text = '';
    }
  }
});


export const {showMessage,clearMessage} = MessageSlice.actions;
export default MessageSlice.reducer;