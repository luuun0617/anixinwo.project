import { useState, useMemo,useEffect } from "react";
import { db } from "../firebaseConfig";
import {collection, getDocs } from "firebase/firestore";

import { PropertyListHero, PropertyList, PropertyPagination } from "../components/Search/property-list";

import { useDispatch } from "react-redux";
import { showMessage } from "../store/MessageSlice";


const ITEMS_PER_PAGE = 8;


function PropertyListPage() {
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    location: "any",
    rent: "any",
    layout: "any",
    other: "any",
  });

  const dispatch= useDispatch();

  const [currentPage, setCurrentPage] = useState(1);

  const [properties,setProperties]= useState([]);
  const [isLoading,setIsLoading]= useState(true);

  const handleSearchChange = (newFilters) => {
    setSearchFilters(newFilters);
    setCurrentPage(1);
  };

  useEffect(()=>{
    const fetchProperties= async()=>{
      try{
        setIsLoading(true);
        const houseRef=collection(db,'houses');
        const querySnapshot= await getDocs(houseRef);

        const houseData=querySnapshot.docs.map(doc=>({
          id:doc.id,
          ...doc.data()
        }));

        setProperties(houseData);
      }catch(err){
        console.error("讀取房屋資料時發生錯誤:",err);
        dispatch(showMessage({
          type:"error",
          message:"讀取房屋資料發生錯誤,按下f12確認錯誤,或請你立即連繫客服"
        }))
      }finally{
        setIsLoading(false);
      }
    };
    fetchProperties();
  },[dispatch]);

  useEffect(()=>{
    window.scrollTo({
      top:0,
      behavior:"smooth"
    })
  },[currentPage])

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((prop) => {

      if (searchFilters.keyword?.trim()) {
        const lowerKeyword = searchFilters.keyword.toLowerCase();
        if (!prop.title.toLowerCase().includes(lowerKeyword) && !prop.address.toLowerCase().includes(lowerKeyword)) {
          return false;
        }
      }

      if (searchFilters.location && searchFilters.location !== "any") {

        const normalizedLocation = searchFilters.location.replace(/臺/g, '台');
        const normalizedAddress = prop.address.replace(/臺/g, '台');

        if (!normalizedAddress.includes(normalizedLocation)) {
          return false;
        }
      }

      if (searchFilters.rent && searchFilters.rent !== "any") {
        const price = prop.price;
        if (searchFilters.rent === "10000-") {
          if (price >= 10000) return false;
        } else if (searchFilters.rent === "10000-20000") {
          if (price < 10000 || price > 20000) return false;
        } else if (searchFilters.rent === "20000-40000") {
          if (price < 20000 || price > 40000) return false;
        } else if (searchFilters.rent === "40000+") {
          if (price <= 40000) return false;
        }
      }

      if (searchFilters.layout && searchFilters.layout !== "any") {
        if (!prop.layout) return false;
        if (searchFilters.layout === "1" && prop.layout.room !== 1) return false;
        if (searchFilters.layout === "2" && prop.layout.room !== 2) return false;
        if (searchFilters.layout === "3" && prop.layout.room !== 3) return false;
        if (searchFilters.layout === "4+" && prop.layout.room < 4) return false;
      }

      if (searchFilters.other && searchFilters.other !== "any") {
        if (searchFilters.other === "elevator") {
          if (prop.typeId !== "t4" && prop.typeId !== "t1") return false;
        }
        if (searchFilters.other === "parking") {
          if (!prop.title.includes("車位")) return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const favorA = a.isHot ? 1 : 0;
      const favorB = b.isHot ? 1 : 0;
      return favorB - favorA;
    });

  }, [searchFilters, properties]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  return (
    <>
      <PropertyListHero onSearchChange={handleSearchChange} />

      <section className="property-list-section">
        <div className="property-list-section__inner">
          {
            isLoading?(
              <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>資料載入中，請稍候...</div>
            ):(
              <>
                <PropertyList properties={paginatedProperties} />
                {filteredProperties.length > 0 ? 
                  (<PropertyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />):
                  (<div style={{ textAlign: "center", padding: "40px", color: "#888" }}>沒有符合條件的房源。</div>)
                }
              </>
            )
          }
        </div>
      </section>
    </>
  );
}

export default PropertyListPage;
