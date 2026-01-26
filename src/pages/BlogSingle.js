import { useState, useEffect } from "react";
import './Blog.css';
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";





const BlogSingle = () => {
  const {slug} = useParams();
  const [posts, setPosts] = useState(null);
  
  useEffect(

    () => {
      fetch(`https://front2.edukacija.online/backend/wp-json/wp/v2/posts?slug=${slug}&_embed`)
      .then(response => response.json())
      .then((data) => setPosts(data[0]))
        
        }, [slug]
      )
    
  
  console.log(posts)

  if(!posts) return  <Loader />
  return (
    <>
        <div className="blog-single">
      <div
        class="masthead"
        style={{
          backgroundImage:
            "url(" +
            posts._embedded["wp:featuredmedia"][0].media_details.sizes.full
              .source_url +
            ")",
        }}
      >
        <div class="container position-relative px-4 px-lg-5">
          <div class="row gx-4 gx-lg-5 justify-content-center">
            <div class="col-md-10 col-lg-8 col-xl-7">
              <div class="post-heading">
                <h1>{posts.title.rendered}</h1>
                <h2 class="subheading"></h2>
                <span class="meta">
                  Autor:
                  <a href="#!">{posts._embedded.author[0].name}</a>,{" "}
                  {new Date(posts.date).toLocaleDateString("hr-HR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <article class="mb-4">
        <div class="container px-4 px-lg-5">
          <div class="row gx-4 gx-lg-5 justify-content-center">
            <div class="col-md-10 col-lg-8 col-xl-7">
              <div
                dangerouslySetInnerHTML={{ __html: posts.content.rendered }}
              ></div>
            </div>
          </div>
        </div>
      </article>
    </div>
    </>
  );
};

export default BlogSingle;
