import { useState, useEffect, useRef } from "react";
import { db } from '../../firebaseConfig';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs ,query,where, doc,setDoc,deleteDoc,serverTimestamp} from "firebase/firestore";

import { useDispatch } from "react-redux";
import { showMessage } from "../../store/MessageSlice";

import SingleHouseCard from "./SingleHouseCard/SingleHouseCard";
import SpecialCard from "./SingleHouseCard/SpecialCard";


const HouseCard=()=>{
  const scrollRef= useRef(null);

  const [houseDatas,setHouseDatas]=useState([]);
  const [houseType,setHouseType]= useState([]);

  const [visibleIds,setVisibleIds]= useState(new Set());

  const [isLoading,setIsLoading]= useState(true);

  const [updatingIds, setUpdatingIds] = useState(new Set());

  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();
    
  const dispatch= useDispatch();

  useEffect(() => {
    const fetchHousesAndFavorites = async () => {
      setIsLoading(true);
      try {
        const hotHouseQuery = query(
          collection(db, "houses"),
          where('isHot', "==", true)
        );

        const [houseSnap, typeSnap] = await Promise.all([
          getDocs(hotHouseQuery),
          getDocs(collection(db, 'houseTypes'))
        ]);

        const typeMap = {};
        typeSnap.docs.forEach((doc) => {
          typeMap[doc.id] = doc.data().name;
        });
        setHouseType(typeMap);

        let fetchedHouses = houseSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isFavor: false 
        }));

        if (currentUser) {
          const favQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', currentUser.uid)
          );
          const favSnapshot = await getDocs(favQuery);
                    
          const favoriteHouseIds = new Set(
            favSnapshot.docs.map(doc => doc.data().houseId)
          );
          fetchedHouses = fetchedHouses.map(house => ({
            ...house,
            isFavor: favoriteHouseIds.has(house.id)
          }));
        }

        setHouseDatas(fetchedHouses);

      } catch (err) {
        console.error("抓取失敗:" + err?.message);
        dispatch(showMessage({
          type: "error",
          text: "資料載入失敗，請稍後再試！或者立即連繫客服!"
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHousesAndFavorites();
  }, [currentUser, dispatch]);

  const handleFavorite = async(id, currentStatus) => {
    if (updatingIds.has(id)) return;

    const nextStatus = !currentStatus;
        
    if (!currentUser) {
      dispatch(showMessage({
        type:"warning",
        text:"請先登入會員，才能收藏房屋喔！(◕KZ◕)"
      }));
      return;
    };
    setUpdatingIds(prev => new Set(prev).add(id));

    setHouseDatas(prev => prev.map(house => 
      house.id === id ? { ...house, isFavor: nextStatus } : house
    ));

    try{
      const favorDocId= `${currentUser.uid}_${id}`;
      const favorRef = doc(db,'favorites',favorDocId);

      if(nextStatus){
        await setDoc(favorRef,{
          userId: currentUser.uid,
          houseId:id,
          createAt:serverTimestamp(),
        });
      }else{
        await deleteDoc(favorRef);
      }

      const clickedHouse = houseDatas.find(house => house.id === id);
      const title = clickedHouse ? clickedHouse.title : "該房屋";
      dispatch(showMessage({
        type:"success",
        text:`${title} 已${nextStatus?"加入":"移除"}收藏!`
      }))
    }catch(err){
      console.error("❌ 雲端同步失敗，正在還原本地狀態...", err);
      setHouseDatas(prev => prev.map(house => 
        house.id === id ? { ...house, isFavor: currentStatus } : house
      ));
      console.error("❌ 錯誤詳情：", err.message);
      dispatch(showMessage({
        type:"error",
        text:`發生錯誤,請按f12確認錯誤訊息,或連繫客服`
      }));
    }finally{
      setUpdatingIds(prev => {
        const nxt = new Set(prev);
        nxt.delete(id);
        return nxt;
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(()=>{
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prevIds) => {
          const newIds = new Set(prevIds);
          entries.forEach((entry) => {
            const id = entry.target.getAttribute('data-id');
            if (entry.isIntersecting && entry.intersectionRatio >= 0.99) {
              newIds.add(id);
            } else {
              newIds.delete(id);
            }
          });
          return newIds;
        });
      },
      {
        root: scrollRef.current,
        threshold: [0.99],
      }
    );

    const elements = scrollRef.current?.querySelectorAll('.house-card-wrapper');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  },[houseDatas])

  const handleScroll = (direction)=>{
    const {current} = scrollRef;
    if(current){
      const scrollAmount = 350;

      if(direction==='left'){
        current.scrollBy({left:-scrollAmount,behavior:"smooth"});
      }else if(direction==='right'){
        current.scrollBy({left:scrollAmount,behavior:"smooth"});
      }
    }
  };

  return (
    <>
      <div className='container-fluid py-4 my-5 mt-5'> 
        <div 
          id="select1"
          className="select1 slide rounded-4 mx-auto"
          style={{ maxWidth: '1400px' }}> 
                    
          {/* 💡 標題與桌機版按鈕區塊 */}
          <div className="ps-4 pe-4">
            <h1 className="fw-bold mb-2">熱門首選</h1>
            <div className="d-flex align-items-center">
              <span className="text-muted text-nowrap">你不可錯過的精選租屋處</span>
              <hr className="ms-3 flex-grow-1" style={{border: "1.5px solid #9cb7c4", opacity: "1.5", maxWidth: "80px"}} />
              <div 
                className="d-none d-md-flex ms-auto gap-2">
                <button 
                  type="button" 
                  className="btn btn-houseCard-custom rounded-circle btn-icon"
                  onClick={()=>handleScroll('left')}>
                  <i className="bi bi-arrow-left"></i>
                </button>
                <button 
                  type="button"
                  className="btn btn-houseCard-custom rounded-circle btn-icon"
                  onClick={()=>handleScroll('right')}>
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 橫向滑動卡片區 */}
          <div
            ref={scrollRef}
            className="house-scroll-container ps-4 py-4" 
            style={{ 
              marginTop: "10px", 
              overflowX:'auto',
              scrollbarWidth:"none",
              msOverflowStyle:"none"
            }}> 
            <div className='d-flex flex-nowrap gap-3 gap-md-4'>
              {isLoading?(
                Array.from({ length: 5 }).map((_, index) => (
                  <div className="flex-shrink-0 house-card-wrapper opacity-100" key={`skeleton-${index}`}>
                    <div className="card h-100 custom-card placeholder-glow" style={{ borderRadius: '16px', border: 'none' }}>
                      {/* 圖片區塊 */}
                      <div className="placeholder w-100 bg-secondary" style={{ height: "230px", borderRadius: '16px 16px 0 0', opacity: 0.2 }}></div>
                      <div className="card-body px-3">
                        <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                          {/* 標題 */}
                          <span className="placeholder col-7 rounded bg-secondary opacity-25"></span>
                          <span className="placeholder col-1 rounded-circle bg-secondary opacity-25" style={{ height: '20px', width: '20px' }}></span>
                        </div>
                        {/* 地址 */}
                        <p className="placeholder col-9 rounded mb-2 mt-2" style={{ backgroundColor: '#6F5D42', opacity: 1 }}></p>
                        {/* 房屋屬性 (格局/坪數) */}
                        <p className="placeholder col-11 rounded mb-2" style={{ backgroundColor: '#808080', opacity: 0.25 }}></p>
                        {/* 價格 */}
                        <h5 className="placeholder col-5 rounded bg-secondary opacity-50 mt-4 mb-1"></h5>
                      </div>
                    </div>
                  </div>
                ))
              ):(
                houseDatas.slice(0, 5).map((item) => {

                  const typeName = houseType[item.typeId] || "未知類型";

                  const isVisible= visibleIds.has(String(item.id));

                  const isUpdating = updatingIds.has(String(item.id));

                  return(
                    <SingleHouseCard 
                      key={item.id}
                      item={item}
                      typeName={typeName}
                      isVisible={isVisible}
                      isUpdating={isUpdating}
                      onFavorite={handleFavorite}
                    />
                  )
                })
              )
                                
              }
              {
                !isLoading && houseDatas.length>0 &&(
                  <SpecialCard key='special-card' visibleIds={visibleIds}/>
                )
              }
                            

            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default HouseCard;