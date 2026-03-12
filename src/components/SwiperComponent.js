import { Swiper, SwiperSlide } from 'swiper/react';
import FeaturedImg from './FeaturedImg'
import 'swiper/css';

export default ({posts}) => {
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={3}
      onSlideChange={() => console.log('slide change')}
      onSwiper={(swiper) => console.log(swiper)}
    >
        {posts.map((post) => {
            return(
      <SwiperSlide>
        <FeaturedImg post={post} fallback={"https://i.pravatar.cc/300"} /> </SwiperSlide>
      
      
        )})}
    </Swiper>
    
  );
};