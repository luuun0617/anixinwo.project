import {useState,useEffect} from 'react';
import {db} from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Link } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { showMessage } from '../../store/MessageSlice';
const EveryoneInterest = ({currentHouseId,currentUser}) => {
  const [recommendDatas,setRecommendDatas]= useState([]);
  const [isLoading,setIsLoading]= useState(true);



  const [updatingIds,setUpdatingIds]= useState(new Set());
  const dispatch= useDispatch();

  useEffect(()=>{
    const fetchRandomHouses= async()=>{
      try{
        setIsLoading(true);
        const houseRef= collection(db,"houses");
        const querySnapshot= await getDocs(houseRef);
                
        const allHousesData= querySnapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data()
        }));

        const otherHouses= currentHouseId? 
          allHousesData.filter(house=>house.id!==currentHouseId):
          allHousesData

        const shuffledHouses = [...otherHouses].sort(()=>0.5-Math.random());

        const randomFour = shuffledHouses.slice(0, 4);

        if (currentUser) {
          const mappedData = await Promise.all(
            randomFour.map(async (house) => {
              const favorDocId = `${currentUser.uid}_${house.id}`;
              const favorRef = doc(db, 'favorites', favorDocId);
              const favorSnap = await getDoc(favorRef);
              return {
                ...house,
                isFavor: favorSnap.exists()
              };
            })
          );
          setRecommendDatas(mappedData);
        } else {
          const mappedData = randomFour.map(house => ({ ...house, isFavor: false }));
          setRecommendDatas(mappedData);
        }
      }catch(err){
        console.error("隨機取資料時發生錯誤:",err);
        dispatch(showMessage({
          type:"error",
          text:"取得推薦房屋時發生錯誤,按f12確認詳細資訊,或連繫客服"
        }))
      }finally{
        setIsLoading(false);
      }
    };
    fetchRandomHouses();
  },[currentHouseId,currentUser,dispatch]);
    

  // 收藏功能
  const handleFavorite= async(e,id,currentState)=>{
    e.preventDefault();
    if(updatingIds.has(id)) return;
        
    const nextStatus= !currentState;

    if (!currentUser) {
      dispatch(showMessage({
        type: "warning",
        text: "請先登入會員，才能收藏房屋喔！(◕KZ◕)"
      }));
      return;
    };
    setUpdatingIds(prev => new Set(prev).add(id));
        
    setRecommendDatas(prev => prev.map(house => 
      house.id === id ? { ...house, isFavor: nextStatus } : house
    ));

    try {
      const favorDocId = `${currentUser.uid}_${id}`;
      const favorRef = doc(db, 'favorites', favorDocId);
      if (nextStatus) {
        await setDoc(favorRef, {
          userId: currentUser.uid,
          houseId: id,
          createAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(favorRef);
      }

      const clickedHouse = recommendDatas.find(house => house.id === id);
      const title = clickedHouse ? clickedHouse.title : "該房屋";
      dispatch(showMessage({
        type: "success",
        text: `${title} 已${nextStatus ? "加入" : "移除"}收藏!`
      }));
            
    } catch (err) {
      console.error("雲端同步失敗，還原本地狀態...", err);
      setRecommendDatas(prev => prev.map(house => 
        house.id === id ? { ...house, isFavor: currentState } : house
      ));
      dispatch(showMessage({
        type: "error",
        text: `發生錯誤,請按f12確認錯誤訊息,或者聯繫客服`
      }));
    } finally {
      setUpdatingIds(prev => {
        const nxt = new Set(prev);
        nxt.delete(id);
        return nxt;
      });
    }
  }   

  return (
    <section className="mb-5">
      {/* 標題 */}
      <h3 className="fs-5 fw-bold mb-3">
        大家都在看......
      </h3>

      {/* 卡片 */}
      <div className="house-scroll-container">
        <div className='d-flex flex-nowrap gap-3 gap-md-4'>
          {
            isLoading?(
              <>
                <div className="text-center py-5 text-secondary small">推薦房源載入中...</div>
              </>
            ):(
              <>
                {
                  recommendDatas.map((item)=>{
                    const isThisCardUpdating = updatingIds.has(item.id);      
                    return(
                      <div className="flex-shrink-0 house-card-wrapper " key={item.id}>
                        <Link 
                          to={`/item/${item.id}`} 
                          className="text-decoration-none text-dark d-block interest-house-cards">
                          <div className="card h-100 border-0 bg-transparent">
                            <img 
                              src={item.img} 
                              alt={item.title} 
                              className="w-100 rounded-3" 
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                                                    
                            <div className="p-2 mt-1">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <h5 className="fs-6 fw-bold mb-0 text-dark">{item.title}</h5>
                                <i 
                                  className={`bi ${item.isFavor ? "bi-heart-fill" : "bi-heart"} text-primary ${isThisCardUpdating ? 'opacity-50' : ''}`}
                                  style={{ 
                                    cursor: isThisCardUpdating ? 'default' : 'pointer', 
                                    pointerEvents: isThisCardUpdating ? 'none' : 'auto' 
                                  }}
                                                                
                                  onClick={(e) => !isThisCardUpdating && handleFavorite(e, item.id, item.isFavor)}    
                                ></i>
                              </div>

                              <p className="text-secondary small mb-1 text-truncate">
                                {item.address}
                              </p>
                                                        
                              {/* 💡 房屋規格：用字串組合的方式顯示 Firebase 中的 age 和 size */}
                              <p className="text-secondary small mb-2">
                                屋齡 {item.age}年 | 坪數 {item.size}坪
                              </p>
                                                        
                              {/* 💡 價格：加上 toLocaleString() 讓數字有千分位逗號 */}
                              <p className="fw-bold mb-0 text-danger" style={{ fontSize: '15px' }}>
                                ${item.price?.toLocaleString()} <span className="fw-normal text-secondary small">/ 月租</span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )})
                }
              </>
            )
          }
        </div>
      </div>
    </section>
  )
}

export default EveryoneInterest;