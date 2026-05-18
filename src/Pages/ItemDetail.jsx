import {useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { doc,getDoc, collection , getDocs } from 'firebase/firestore';
import {getAuth,onAuthStateChanged} from "firebase/auth";
import { db } from '../firebaseConfig';

import HousePicture from "../components/ItemDetail/HousePicture";
import EstateDeta from "../components/ItemDetail/EstateDeta";
import BasicDeta from "../components/ItemDetail/BasicDeta";
import Equipment from "../components/ItemDetail/Equipment";
import Map from "../components/ItemDetail/Map";
import EveryoneInterest from "../components/ItemDetail/EveryoneInterest";
import { useDispatch } from 'react-redux';
import { showMessage } from '../store/MessageSlice';

const ItemDetail = () => {
  const dispatch=useDispatch();

  const {id}= useParams();

  const [houseData,setHouseData]= useState(null);
  const [loading,setLoading] =useState(true);

  const [currentUser,setCurrentUser]= useState(null);

  useEffect(()=>{
    const auth= getAuth();
    const unsubscribe= onAuthStateChanged(auth,(user)=>{
      setCurrentUser(user? user:null);
    });
    return ()=>unsubscribe();
  },[]);

  useEffect(()=>{
    const fetchAllDatas= async()=>{
      try{
        const houseRef = doc(db,"houses", String(id));
        const typeRef = collection(db,'houseTypes');
        const equipRef = collection(db,'equipmentIds');
        const reqRef = collection(db,'requirementIds');

        const [houseSnap,typeSnap,equipSnap,reqSnap] = await Promise.all([
          getDoc(houseRef),
          getDocs(typeRef),
          getDocs(equipRef),
          getDocs(reqRef),
        ]);

        if(houseSnap.exists()){
          const houseRaw = houseSnap.data();

          const typeMap ={};
          typeSnap.forEach((doc)=>{
            typeMap[doc.data().id]=doc.data();
          });

          const equipMap={};
          equipSnap.forEach((doc)=>{
            equipMap[doc.data().id]=doc.data();
          });

          const reqMap={};
          reqSnap.forEach((doc)=>{
            reqMap[doc.data().id]=doc.data();
          });

          const fullEquipments = (houseRaw.equipmentIds||[])
            .map(eqId=>equipMap[eqId])
            .filter(Boolean);

          const fullRequirements= (houseRaw.requirementIds||[])
            .map(reqId=>reqMap[reqId])
            .filter(Boolean);

          const typeName= typeMap[houseRaw.typeId]?.name||"未知類型";

          let isFavorStatus= false;
          if(currentUser){
            const favorDocId= doc(db,'favorites',`${currentUser.uid}_${id}`);
            const favorSnap= await getDoc(favorDocId);
            isFavorStatus= favorSnap.exists()?true:false;
          }
          const fullHouseData={
            id:houseSnap.id,
            ...houseRaw,
            typeName:typeName,
            equipments:fullEquipments,
            requirements:fullRequirements,
            isFavor: isFavorStatus,
          }

          setHouseData(fullHouseData);
                    
        }else{
          dispatch(showMessage({
            type:"error",
            text:"無法找到該筆房屋資料,如有問題,請洽客服!"
          }))
        }
      }catch(err){
        console.error("取得詳細資料失敗!",err);
        dispatch(showMessage({
          type:"error",
          text:"無法取得詳細資料,如有問題,請洽客服!"
        }))
      }finally{
        setLoading(false);
      }
    };

    fetchAllDatas();

  },[id,currentUser,dispatch]);

  if(loading){
    return (
      <div className="container py-5 text-center">
        <h2>
          資料載入中...
        </h2>
      </div>
    )
  };
            
  if(!houseData){
    return(
      <div className="container py-5 text-center">
        <h2>
          找不到該筆房屋資料 (◕︵◕)
        </h2>
      </div>
    )
  }
    
  return (
    <>
      <div className="container py-4 py-lg-5">
        <section className="row gy-4 mb-5 mt-2">
          <div className="col-lg-6">
            <HousePicture houseData={houseData}/>
          </div>
          <div className="col-lg-6">
            <div className="p-0 p-md-4 rounded-4 h-100">
              <EstateDeta houseData={houseData}/>
            </div>
          </div>
        </section>

        <BasicDeta houseData={houseData}/>
        <Equipment houseData={houseData}/>

        {/* 地圖索引 */}
        <Map houseData={houseData}/>
                
        {/* 大家都在看 */}
        <EveryoneInterest 
          currentHouseId={id}
          currentUser={currentUser}/>
      </div>
    </>
  );
}

export default ItemDetail;