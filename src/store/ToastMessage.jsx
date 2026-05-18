import { useEffect } from "react";

import { useSelector, useDispatch } from 'react-redux';

import { clearMessage } from "./MessageSlice";

export default function ToastMessage(){

  const dispatch=useDispatch();
  const {isOpen,type,text}= useSelector((state)=>state.message);
  useEffect(()=>{
    if(isOpen){
      const timer= setTimeout(()=>{
        dispatch(clearMessage());
      },3000);
      return ()=>clearTimeout(timer);
    };
  },[isOpen ,dispatch]);

  if(!isOpen) return null;

  let alertClass= ''
    
  if(type==='success'){
    alertClass='alert-success';
  }else if(type==='warning'){
    alertClass ='alert-warning';
  }else if(type==='error'){
    alertClass='alert-danger';
  }else if(type==='normal'){
    alertClass = 'alert-info';
  }

  return (
    <div
      className={`alert ${alertClass} shadow-lg`}
      style={{
        position:"fixed",
        top:"30px",
        left:"50%",
        transform:'translateX(-50%)',
        zIndex:10000,
        minWidth: '300px',
        textAlign:'center'
      }}>
      <strong>{text}</strong>
    </div>
  )
}