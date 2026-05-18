import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from '../../firebaseConfig'; 
import { collection, query, where, getDocs } from "firebase/firestore";

import { showMessage } from "../../store/MessageSlice";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc,setDoc,deleteDoc,serverTimestamp } from "firebase/firestore";
import { useDispatch } from "react-redux";

import Swal from 'sweetalert2';

import ContactCard from "./ContactCard/ContactCard";
import BookingViewing from "./ContactCard/BookViewing";
const EstateDeta = ({ houseData }) => {

  const [currentUser, setCurrentUser] = useState(null);
  const [isFavor, setIsFavor] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
    
  const [showContactAlert, setShowContactAlert] = useState(false);
  const [showBookingAlert, setShowBookingAlert] = useState(false);

  const navigate= useNavigate();

  const dispatch = useDispatch();
  const auth = getAuth();

  useEffect(() => {
    if (houseData) {
      setIsFavor(houseData.isFavor);
    }
  }, [houseData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleFavoriteClick = async () => {
    if (!houseData?.id) return;

    if (!currentUser) {
      dispatch(showMessage({
        type: "warning",
        text: "請先登入會員，才能收藏房屋喔！(◕KZ◕)"
      }));
      return;
    }

    if (isUpdating) return;

    const currentStatus = isFavor;
    const nextStatus = !currentStatus;
    const id = houseData.id;

    setIsFavor(nextStatus);
    setIsUpdating(true);

    try {
      const favoriteDocId = `${currentUser.uid}_${id}`;
      const favoriteRef = doc(db, "favorites", favoriteDocId);

      if (nextStatus) {
        await setDoc(favoriteRef, {
          userId: currentUser.uid,
          houseId: id,
          createAt: serverTimestamp()
        });
      } else {
        await deleteDoc(favoriteRef);
      }
            
      const title = houseData?.title || "該房屋";
      dispatch(showMessage({
        type:"success",
        text: `${title} ${nextStatus ? "已加入" : "已移除"}收藏！`
      }))
    } catch (err) {
      console.error("❌ 雲端同步失敗，正在還原本地狀態...", err);
      setIsFavor(currentStatus);
      dispatch(showMessage({
        type: "error",
        text: `發生錯誤,請聯繫客服!`
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBookingCard=async()=>{
    if(currentUser){
      setShowBookingAlert(true);
    }else{
      const result=await Swal.fire({
        icon:'warning',
        title:"請先登入",
        text:"請先登入會員，才能預約看房喔！(◕KZ◕)",
        showCancelButton:true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor:"#6c757d",
        confirmButtonText:"我要登入",
        cancelButtonText:"取消"
      });

      if (result.isConfirmed){
        navigate('/sign')
      }
      return;
    }
  };

  const submitBookingData =async(formData)=>{
    if(currentUser){
      try{
        const checkBookingsRef = collection(db, "UserBooking");
        const q= query(
          checkBookingsRef,
          where('houseId','==',houseData.id),
          where('userId','==',currentUser.uid)
        );

        const querySnapshot = await getDocs(q);

        let isRecentlyBooked= false;

        if(!querySnapshot.empty){
          const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
          const now= new Date().getTime();

          querySnapshot.forEach((doc)=>{
            const pastBooking= doc.data();

            if (pastBooking.createAt) {
              const pastBookingTime = pastBooking.createAt.toMillis();
              if (now - pastBookingTime < THREE_DAYS_MS) {
                isRecentlyBooked = true;
              }
            }
          });
        };

        if(isRecentlyBooked){
          Swal.fire({
            icon:'error',
            title:"你已登記過該房屋預約了",
            text:"使用者不可以在三天內預約同一間房,如有問題,請洽客服0912-345-678",
            confirmButtonColor: '#3085d6',
            confirmButtonText:"確認",
          })
          return;
        }

        const bookingId= `${currentUser.uid}_${Date.now()}`;
        const bookingRef= doc(db,'UserBooking',bookingId);

        await setDoc(bookingRef,{
          userId: currentUser.uid,
          houseId: houseData.id,
          houseTitle: houseData.title,
          ...formData,
          createAt:serverTimestamp()
        });

        dispatch(showMessage({
          type:"success",
          text:"繳交預約房屋資料成功,請等待1~3個工作天,會有專人來與你連絡!"
        }));

        setShowBookingAlert(false);

      }catch(err){
        console.error("❌ 預約看房提交失敗：", err);
        dispatch(showMessage({
          type: "error",
          text: "預約失敗，請稍後再試。按f12可以確認詳細錯誤資訊!或是聯繫客服"
        }));
      }
    } else {
      const result=await Swal.fire({
        icon:'warning',
        title:"請先登入",
        text:"請先登入會員，才能預約看房喔！(◕KZ◕)",
        showCancelButton:true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor:"#6c757d",
        confirmButtonText:"我要登入",
        cancelButtonText:"取消"
      });
      if (result.isConfirmed){
        navigate('/sign')
      }
      return;
    }
  }

  const isCollectedClass = isFavor ? `bi-heart-fill` : `bi-heart`;
  const sex = houseData?.contact?.sex === 'male' ? '先生' : '女士';

  return (
    <div style={{ paddingBottom: "2rem" }}>
            
      {/* 上方文字區塊：標題、副標、地址與標籤 */}
      <div className="d-flex justify-content-between mt-3 ms-3">
        <div>
          <h3 className="fw-bold text-dark">
            {houseData?.title || "找不到資料"}
          </h3>
          <p className="fw-medium mt-2 mb-1" style={{ color: "#565656" }}>
            {houseData?.description || "沒有任何描述"}
          </p>
          <p className="small mt-2 mb-0" style={{ color: "#6F5D42" }}>
            {houseData?.address || "找不到資料"}
          </p>
        </div>

        <i 
          className={`bi ${isCollectedClass} text-primary me-4 mt-1 ${isUpdating ? 'opacity-50' : ''}`} 
          style={{ 
            cursor: isUpdating ? 'default' : "pointer",
            fontSize: "24px",
            transition: "transform 0.2s",
            pointerEvents: isUpdating ? 'none' : 'auto'
          }}
          onClick={handleFavoriteClick}
        ></i>
      </div>
                
      <div className="d-flex flex-wrap gap-2 mt-3 ms-2">
        <span className="tag">{houseData?.typeName || "未知類型"}</span>
        <span className="tag">屋齡{houseData?.age || 0}年</span>
        <span className="tag">
          {houseData?.floorInfo?.current || "-"}F/{houseData?.floorInfo?.total || "-"}F
        </span>
        <span className="tag">建物{houseData?.size || 0}坪</span>
        <span className="tag">
          {houseData?.layout?.room || 0}房(室)
          {houseData?.layout?.hall || 0}廳
          {houseData?.layout?.bathroom || 0}衛
        </span>
      </div>
            
      <div className="ms-3 mt-4">
        <h3 className="price mb-0">
          ${houseData?.price?.toLocaleString() || "找不到資料"}/ 月租
        </h3>
      </div>

      <div className="card mt-4 mx-0 mx-md-3 border-0" style={{ borderRadius: "8px" }}> 
        <div className="card-body p-3 px-4 px-md-3">
          <div className="d-flex align-items-center mb-3">
            <div className="flex-shrink-0" style={{ width: '48px', height: '48px' }}>
              <img 
                src={houseData?.contact?.picture || null} 
                alt="房東頭像" 
                className="w-100 h-100 rounded-circle object-fit-cover bg-secondary" 
              />
            </div>

            <div className="ms-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="text-secondary small" style={{ fontSize: '16px',width:"64px" ,color: "#808080"}}>{houseData?.contact?.role || "找不到資料"}</span>
                <h6 className="mb-0">{houseData?.contact?.name || "找不到資料"} {sex}</h6>
              </div>
              <div className="d-flex">
                <p className="mb-0 text-secondary me-2" style={{ fontSize: '16px' ,color: "#808080"}}>聯絡電話</p>
                <p className="mb-0">{houseData?.contact?.tel || "找不到資料"}</p>
              </div>
            </div>
          </div>
          <div className='row g-3 pt-3'>
            <div className="col-6">
              <button 
                className="book-viewing w-100 mt-2"
                onClick={handleBookingCard}
              >
                預約看房
              </button>
            </div>

            <div className="col-6">
              <button 
                className="contact w-100 mt-2"
                onClick={()=>setShowContactAlert(true)}>
                立即電話聯絡
              </button>
            </div>
                        
          </div>
        </div>
      </div>


      {/* 顯示預約看房小卡 */}
            
      {
        showBookingAlert && (
          <BookingViewing 
            houseData={houseData}
            setShowBookingAlert={setShowBookingAlert}
            submitBookingData={submitBookingData} // 💡 將寫入 Firebase 的方法當作 props 傳入
          />
        )
      }

      {/* 顯示立刻聯絡小卡 */}
      {
        showContactAlert && (
          <>
            <ContactCard 
              houseData={houseData}
              setShowContactAlert={setShowContactAlert}
            />
          </>
        )
      }

            
    </div>
  );
};

export default EstateDeta;