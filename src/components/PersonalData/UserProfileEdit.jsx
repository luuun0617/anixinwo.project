import { useState, useEffect } from 'react';
import { doc, getDoc ,updateDoc,setDoc} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebaseConfig';

import { useDispatch } from 'react-redux';
import { showMessage } from '../../store/MessageSlice';
import userIcon from '../../icons/home/user-icon.svg'
import BasicData from './Datas/BasicData';
import ConnectData from './Datas/ConnectData';

const UserProfileEdit = () => {
  const [userData,setUserData]= useState(null);

  const [isLoading,setIsLoading]= useState(true);
    
  const dispatch= useDispatch();

  useEffect(()=>{
    const auth=getAuth();
    const unsubscribe= onAuthStateChanged(auth,async(user)=>{
      if(user){
        try{
          const userDocRef=doc(db,'users',user.uid);
          const docSnap= await getDoc(userDocRef);

          if(docSnap.exists()){
            const firestoreData = docSnap.data();
            setUserData({
              ...firestoreData, 

              email: firestoreData.email || user.email || '',

              img: firestoreData.img || user.photoURL || '',
              name: firestoreData.name || user.displayName || ''
            });
          }

          else{
            setUserData({
              email: user.email || '',
              img: user.photoURL || '',
              name: user.displayName || ''
            });
          }
        }catch(err){
          console.error('讀取資料失敗!',err);
          dispatch(showMessage({
            type:"error",
            text:"讀取資料失敗,請按f12查看詳細錯誤資訊!或者聯繫客服"
          }))
        }
      }else{
        setUserData(null);    
      }
      setIsLoading(false);
    });

    return ()=>unsubscribe();
  },[dispatch]);

  const handleDataUpdate = async(updateFields)=>{

    const auth = getAuth();
    const currentUser= auth.currentUser;

    if(!currentUser){
      dispatch(showMessage({
        type:"warning",
        text:"請先登入!"
      }));

      return false;
    }
    try{
      const userDocRef= doc(db,'users',currentUser.uid);

      const docSnap = await getDoc(userDocRef);

      if(docSnap.exists()){
        await updateDoc(userDocRef,updateFields);
        dispatch(showMessage({
          type:"success",
          text:"更新資料成功"
        }));
      }
      else{
        await setDoc(userDocRef,updateFields);
        dispatch(showMessage({
          type:"success",
          text:"建立個人資料成功"
        }));
      };

      setUserData((prevData)=>({
        ...prevData,
        ...updateFields
      }));

      dispatch(showMessage({
        type:"success",
        text:"更新資料成功!"
      }));
            
      return true;
    }catch(err){
      console.error('更新資料失敗!',err);
      dispatch(showMessage({
        type:"error",
        text:"更新資料失敗,請按f12確認錯誤資訊!或請你立即連繫客服"
      }));
      return false;
    }
        
  }

  const displayImg = userData?.img || userIcon;
  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      {
        isLoading?(
          <div className="text-center py-5">
            <h1 className='text-bold '>載入個人資訊中...
            </h1>
          </div>
        ):(
          <>
            {/* 頁面標題區塊 */}
            <div className="text-center mb-5">
              <h2 className="fw-semibold mb-2 text-primary-500">個人資訊</h2>
              <p className="text-muted">你的基本資訊和聯絡方式</p>
              <img 
                src={displayImg} 
                alt="預設頭像"
                className='mt-2 rounded-circle border border-2 bg-light border-primary-300'
                style={{width:'100px',height:"100px"}}    
              />
            </div>

            {/* 卡片 1：基本資訊 */}
            <BasicData 
              initialData={userData}
              updateData={handleDataUpdate}/>

            {/* 卡片 2：聯絡資訊 */}
            <ConnectData 
              initialData={userData}
              updateData={handleDataUpdate}/>
          </>
        )
      }
        

    </div>
  );
};

export default UserProfileEdit;