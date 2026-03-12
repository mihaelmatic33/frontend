import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlogSingle from "./BlogSingle";
import posts from '../components/zadaci/data/blog.json' ;
import './Blog.css'
import Loader from '../components/Loader'
import ReactPaginate from "react-paginate";
import ScrollToTop from "../components/ScrollToTop";
import BlogPost from "../components/BlogPost";
import SwiperComponent from "../components/SwiperComponent";
import SEO from "../components/SEO";

const BASE_URL = process.env.REACT_APP_API_URL;

const Blog = () => {
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  

  useEffect(() =>{
    setLoading(true);
    fetch(`${BASE_URL}v2/categories`)
    .then((response)=> response.json())
    .then(
      (data) => {
      setCategories(data);
      console.log(data)
    });

     
    fetch(`${BASE_URL}v2/users?per_page=20`)
    .then((response)=> response.json())
    .then(
      (data) => {
      setAuthors(data);
      console.log(data)
    })
      .finally(() => setLoading(false))
        }, [] );

  useEffect(
    () => {
      setLoading(true)

      const per_page = 6



      let url = `${BASE_URL}v2/posts?_embed&per_page=${per_page}&page=${currentPage +1}` 
      if(selectedCategory) url += "&categories="+ selectedCategory;
      
      if(selectedAuthor) url += "&author="+ selectedAuthor;


      fetch(url)
      .then((response) => {
        const totalPages = response.headers.get("X-WP-TotalPages");
        setPageCount(Number(totalPages))
        return response.json()
      })
      .then((data) => {
        setPosts(data);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedAuthor, currentPage]);
  const [yoast, setYoast] = useState(null);
  useEffect(() => {
  fetch(`${BASE_URL}v2/pages/123`) // ← promijeni 123 u pravi ID stranice Blog
    .then(res => res.json())
    .then(data => {
      if (data.yoast_head_json) {
        setYoast(data.yoast_head_json);
      } else {
        setYoast({ title: "Blog", og_description: "Pročitaj najnovije članke o web developmentu." });
      }
    })
    .catch(() => {
      setYoast({ title: "Blog", og_description: "Pročitaj najnovije članke o web developmentu." });
    });
}, []);








return (
   
    <>
    {yoast && (
  <SEO
    title={
      selectedCategory
        ? `${yoast.title} - ${categories.find(c => c.id === selectedCategory)?.name}`
        : yoast.title
    }
    description={yoast.og_description || yoast.meta_description}
  />
)}
      {loading && <Loader />}
       
      <div className="blog-page">
        <div className="container">
          <h1>Blog</h1>
          <SwiperComponent posts={posts} />
          <div className="row">
            <div className="col-12 d-flex gap-1 mb-2">
              {
                categories.map((category) => (
                  
                  <button className="btn btn-dark text-light " key={category.id}
                  onClick={() => setSelectedCategory(category.id)}>
                    {category.name}
                  </button>
               ))
              }
            </div>
          </div>


          

          <select className="form-select" onChange={
            (e) => setSelectedAuthor(e.target.value)
          }>
            <option value="">Svi autori</option>
            {
              authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
               ))
            }
          </select>
          
          <div className="row">
            {posts.map((post) => {
              
              return (
                <BlogPost key={post.id} post={post}/>
              
              );
            })}
          </div>
          <ReactPaginate
            previousLabel={"previous"}
            nextLabel={"next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={2}
            onPageChange={(e) => {
              setCurrentPage(e.selected)
              setPosts([])
              ScrollToTop()
                     }}
            containerClassName={"pagination"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            activeClassName={"active"}
          />
        </div>
      </div>
    </>
  );
};

export default Blog;
