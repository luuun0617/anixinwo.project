import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '../../firebaseConfig';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { showMessage } from '../../store/MessageSlice';

import CollectedCard from './collectedCard';
import Search from '../../Pages/Search';
const Collected = () => {
  const [houseList, setHouseList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
    
  const dispatch= useDispatch();
  useEffect(()=>{
    const auth = getAuth();
    const unsubscribe= onAuthStateChanged(auth,(user)=>{
      setCurrentUser(user?user:null);
      if(!user) return setIsLoading(false);
    });
    return ()=>unsubscribe();
  },[]);

  const handleRemoveFavorite = async (houseId, houseTitle) => {
    if (!currentUser) return;

    const result = await Swal.fire({
      title : `確定要將 "${houseTitle}" 從收藏中移除嗎？`,
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor:'#dc3545',
      cancelButtonColor:"#6c757d",
      confirmButtonText:"是的，移除收藏",
      cancelButtonText:"先不要",

    })
    if(result.isConfirmed){
      try {
        const favoriteDocId = `${currentUser.uid}_${houseId}`;
        await deleteDoc(doc(db, "favorites", favoriteDocId));

        setHouseList(prevList => prevList.filter(house => house.id !== houseId));

        dispatch(showMessage({ 
          type: "success", 
          text: `已將 ${houseTitle} 從收藏中移除！` 
        }));

      } catch (error) {
        console.error("移除收藏失敗:", error);
        dispatch(showMessage({ 
          type: "error", 
          text: `無法移除 ${houseTitle}，按f12確認錯誤訊息,或連繫客服。` 
        }));
      }
    }
  };

  useEffect(()=>{
    const fetchFavorites= async()=>{
      if(!currentUser){
        setHouseList([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try{
        const favQuery= query(
          collection(db,'favorites'),
          where('userId','==',currentUser.uid)
        );

        const favSnapshot= await getDocs(favQuery);
        const favHouseIds= favSnapshot.docs.map(doc=>doc.data().houseId);
        if(favHouseIds.length===0){
          setHouseList([]);
          setIsLoading(false);
          return;
        }

        const housePromises= favHouseIds.map(id=>
          getDoc(doc(db,'houses',String(id)))
        );

        const [houseSnapshots,typeDataSnapshot]= await Promise.all([
          Promise.all(housePromises),
          getDocs(query(collection(db,'houseTypes')))
        ]);

        const typeData={};
        typeDataSnapshot.forEach(doc=>{
          typeData[doc.id]=doc.data()
        })

        const housesData= houseSnapshots.filter(snap=>snap.exists())
          .map(snap=>
          {
            const houseRaw= snap.data();
            const typeName= typeData[houseRaw.typeId]?.name ||"未知類型";
            return{
              id:snap.id,
              ...snap.data(),
              typeName:typeName,
              isFavor:true
            }
          });  

        setHouseList(housesData);
                    
      }catch(err){
        console.error("抓取收藏資料失敗",err);
        dispatch(showMessage({
          type:"error",
          text:"無法載入收藏資料,請按f12確認錯誤訊息,或連繫客服"
        }))
      }finally{
        setIsLoading(false);
      }
    }
    fetchFavorites();
  },[currentUser,dispatch]);

    
  return (
    <>
      <div className='container py-5'>
        <h1 className='fw-bold text-dark mb-4 text-center'>
          我的個人收藏
        </h1>
        {
          (isLoading)?(
            <div className="text-center py-5 mt-5"><h4>載入收藏中...</h4></div>
          ):(
            <div>
              {houseList.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {
                    houseList.map(house=>(
                      <div key={house.id} className='col'>
                        <CollectedCard house={house} onRemove={handleRemoveFavorite}/>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div 
                  className='d-flex flex-column justify-content-center align-items-center bg-light rounded-4'
                  style={{ minHeight: "60vh" }} 
                >
                  <div className="mb-4 text-secondary" style={{ opacity: 0.4 }}>
                    <i className="bi bi-house-heart" style={{ fontSize: "6rem" }}></i>
                  </div>
                  <h4 className='fw-bold text-dark mb-3'>您的收藏清單空空如也</h4>
                  <p className='text-secondary mb-4 text-center px-3'>
                    目前沒有任何收藏的房屋喔！<br />
                    看到喜歡的房子，記得點擊愛心加入收藏，方便隨時比較。
                  </p>
                  <Link
                    to="/search"
                    element={<Search/>} 
                    className="btn btn-dark px-4 py-2 rounded-pill fw-medium shadow-sm d-flex align-items-center gap-2">
                    <i className="bi bi-search"></i> 立即去尋找好房
                  </Link>
                </div>
              )}
            </div>
          )
        }
      </div>
    </>
  );
};

export default Collected;