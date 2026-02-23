import React, { useEffect, useState } from "react";
import { data } from "react-router-dom";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import ReactPaginate from "react-paginate";
import ScrollToTop from "../components/ScrollToTop";
import BlogPost from "../components/BlogPost";


const BASE_URL = process.env.REACT_APP_API_URL;
const Kategorije = () => {
    const [loading, setLoading] = useState(false);
    const [kategorije,setKategorije] = useState([]);
    const [posts, setPosts] = useState([])
    const [selectedKategorije, setSelectedKategorije] = useState("")
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);

    useEffect(() =>{
        fetch(`${BASE_URL}v2/categories`)
        .then(response => response.json())
        .then(data => setKategorije(data))
    }, []);


    useEffect(() => {
        if(!selectedKategorije) return;
        setLoading(true)
        const per_page = 6

        fetch(`${BASE_URL}v2/posts?categories=${selectedKategorije}&per_page=${per_page}&page=${currentPage +1}`)
        .then((response) => {
        const totalPages = response.headers.get("X-WP-TotalPages");
        setPageCount(Number(totalPages))
        return response.json()
      })
      .then((data) => {
        setPosts(data);
      })
      .finally(() => setLoading(false));
  }, [selectedKategorije, currentPage])


    const handleKategorijeChange = (e) => {
        setSelectedKategorije(Number(e.target.value))
    }



      return (
        <>
        {loading && <Loader />}
   <div className="container blog-page">
    <div className="row">
        <div className="col-12 d-flex justify-content-center">
            <select value={selectedKategorije} onChange={handleKategorijeChange}>
                <option value="" disabled>Odaberite kategoriju</option>
                {kategorije.map(kat =>(
                <option key={kat.id} value={kat.id}>{kat.name}</option>
            ))}
            </select>
            
        </div>
    </div>
     <div className="row">
      {posts.map((post) => {
        return(
            <BlogPost key={post.id} post={post}/>
            );
          })};
          
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
    </>
  );
};

export default Kategorije;
