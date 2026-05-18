import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import { pUrl } from '../../utils/constants';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const HousePicture=({houseData})=>{
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const images = houseData?.SwiperPicture||[];

  const getImageUrl = (imgStr)=>{
    if(!imgStr) return '';
    if(imgStr.startsWith('http')){
      return imgStr;
    }
    return `${pUrl}${imgStr.replace(/^\//, '')}`;
  }

  if(images.length<=0){
    return (
      <div className='text-center py-5 bg-light rounded-3'>
        此房屋暫無提供圖片
      </div>
    )
  }

  return (
    <div className="house-gallery-container">
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="main-swiper mb-3"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img 
              src={getImageUrl(img)} 
              alt={`房屋圖片 ${index + 1}`} 
              className="w-100 object-fit-cover rounded-3" 
              style={{ height: '400px' }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={12}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbs-swiper"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img 
              src={getImageUrl(img)} 
              alt={`房屋縮圖 ${index + 1}`} 
              className="w-100 object-fit-cover rounded-3 cursor-pointer" 
              style={{ height: '80px' }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default HousePicture;