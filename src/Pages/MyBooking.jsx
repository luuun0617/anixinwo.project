
import { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection,getDocs,getDoc,doc,query,where,updateDoc } from 'firebase/firestore';
import { getAuth ,onAuthStateChanged} from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { showMessage } from '../store/MessageSlice';

import Swal from 'sweetalert2'

import BookingList from '../components/MyBooking/BookingList';
const formatTime = (timeCode) => {
  switch(timeCode) {
  case 'morning': return '早上 (09:00 - 12:00)';
  case 'afternoon': return '下午 (13:00 - 17:00)';
  case 'evening': return '晚上 (18:00 - 21:00)';
  default: return '未指定';
  }
};

const checkIsExpired=(bookingDate,timeCode)=>{
  const now= new Date();
  const bookDate= new Date(bookingDate);

  let endHour= 23 ;
  if(timeCode==='morning') endHour=12;
  if(timeCode==='afternoon') endHour=17;
  if(timeCode==='evening') endHour = 21 ;

  bookDate.setHours(endHour,0,0,0);

  return now > bookDate;
};


const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading,setIsLoading]= useState(true);
  const dispatch= useDispatch();

  useEffect(()=>{
    const auth= getAuth();
    const unsubscribe = onAuthStateChanged(auth,(user)=>{
      setCurrentUser(user?user:null);
      if(!user) return setIsLoading(false);
    });
    return ()=>unsubscribe();
  },[]);

    

  useEffect(()=>{
    const fetchBookings=async()=>{
      if(!currentUser) return

      try{
        setIsLoading(true);
        const bookingRef = collection(db,"UserBooking");

        const q= query(
          bookingRef,
          where('userId','==',currentUser.uid)
        );

        const querySnapshot = await getDocs(q);

        const bookingPromises= querySnapshot.docs.map(async(bookingDoc)=>{
          const bookingData= bookingDoc.data();
          const houseId= bookingData.houseId;

          let fetchImage= '';

          if(houseId){
            const houseRef= doc(db,'houses',houseId);
            const houseSnapshot= await getDoc(houseRef);
                        
            if(houseSnapshot.exists()){
              fetchImage= houseSnapshot.data().img;
            }
          }

          const isExpired= checkIsExpired(bookingData.date, bookingData.time);

          return{
            id:bookingDoc.id,
            ...bookingData,
            houseImage:fetchImage,
            isExpired:isExpired
          }
        });

        const bookingDatas = await Promise.all(bookingPromises);

        setBookings(bookingDatas);
      }catch(err){
        console.error("傳輸使用者預約資料時發生錯誤:",err);
        dispatch(showMessage({
          type:"error",
          text:"傳輸使用者資料時發生錯誤,請按下f12確認錯誤!或請你立即連繫客服"
        }))
      }finally{
        setIsLoading(false);
      }
    }
    fetchBookings();
  },[currentUser,dispatch]);

  const getStatusBadge = (isHandle,isExpired,isCanceled) => {
    if (isCanceled) {
      return <span className="badge bg-secondary px-3 py-2 rounded-pill">已取消</span>;
    }
    if(!isHandle&&isExpired){
      return <span className="badge bg-danger px-3 py-2 rounded-pill">已逾期(未在時間內受理看房)</span>;
    }
    if (isHandle) {
      return <span className="badge bg-success px-3 py-2 rounded-pill">已受理預約看房</span>;
    }
    return <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: "#D4A373", color: "white" }}>待處理</span>;
  };

  const handleCancelBooking=async(bookingId,houseName)=>{
    const result= await Swal.fire({
      title : `確定要取消預約看房嗎?`,
      text:`若取消看該房屋(${houseName}),三天後才能夠再預約看該房屋喔!`,
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor:'#dc3545',
      cancelButtonColor:"#6c757d",
      confirmButtonText:"是的，我要取消預約",
      cancelButtonText:"先不要",

    });

    if (!result.isConfirmed) return;

    try{
      const bookingRef= doc(db,'UserBooking',bookingId);

      await updateDoc(bookingRef,{
        isCanceled:true
      });

      setBookings((prevBookings)=>
        prevBookings.map((booking)=>
          booking.id ===bookingId
            ?{...booking,isCanceled:true}
            : booking
        )
      );

      Swal.fire({
        title : `你已取消預約看房成功!`,
        icon:"success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }catch(err){
      Swal.fire({
        title : `取消預約看房失敗!發生錯誤: ${err?.message || '未知錯誤'}`,
        text:"在這方面遇到困難了嗎,請立即洽詢客服諮詢!",
        icon:"error",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor:"#6c757d",
        confirmButtonText:"立即諮詢客服",
        cancelButtonText:"取消",
      });
    }
  }

  const unLoginned = () => {
    if (!currentUser) {
      return (
        <div className="container py-5">
          <div className="text-center py-5 bg-light rounded-4 shadow-sm">
            <i 
              className="bi bi-person-lock display-1 mb-3 d-block" 
              style={{ color: "#D4A373" }}
            ></i>

            <h4 className="fw-bold text-dark mb-3">您尚未登入</h4>
            <p className="text-muted mb-4">請先登入會員，才能查看您的專屬預約紀錄喔！</p>

            <Link 
              to="/sign" 
              className="btn px-5 py-2 rounded-pill fw-bold shadow-sm"
              style={{ backgroundColor: "#D4A373", color: "white" }}
            >
              前往登入
            </Link>
                        
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4 text-dark text-center">我的預約紀錄</h3>
            
      {
        isLoading?(
          <div className="text-center py-5">
            <h3>
              資料載入中，請稍候...
            </h3>
          </div>
        ):(
          !currentUser?(
            unLoginned()
          ):(
            bookings.length === 0 ? (
              <div className="text-center py-5 bg-light rounded-4">
                <h5 className="text-muted">目前沒有任何預約看房紀錄喔！</h5>
                <Link 
                  to='/Search'
                  className="btn mt-3 px-4 rounded-pill" 
                  style={{ backgroundColor: "#D4A373", color: "white" }}>
                  去尋找理想好房
                </Link>
              </div>
            ) : (
              <BookingList 
                bookings={bookings}
                getStatusBadge={getStatusBadge}
                formatTime={formatTime}
                handleCancelBooking={handleCancelBooking}
              />
            )
          )
        )
      }
    </div>
  );
};

export default MyBooking;
