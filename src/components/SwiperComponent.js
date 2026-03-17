import { Swiper, SwiperSlide } from "swiper/react";
import FeaturedImg from "./FeaturedImg";
import "swiper/css";

const BLOG_FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/img/post-sample-image.jpg`;

export default ({ posts }) => {
  return (
    <Swiper spaceBetween={50} slidesPerView={3}>
      {posts.map((post) => {
        return (
          <SwiperSlide key={post.id}>
            <FeaturedImg post={post} fallback={BLOG_FALLBACK_IMAGE} />{" "}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};
