import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import ReactPaginate from "react-paginate";
import BlogPost from "../components/BlogPost";
import SEO from "../components/SEO";
import "./Blog.css";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://front2.edukacija.online/backend/wp-json/wp/";

const POSTS_PER_PAGE = 6;
const MY_AUTHOR_NAMES = ["mihael matic"];

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const isMyPost = (post) => {
  const authorName = normalizeText(post?._embedded?.author?.[0]?.name);
  return MY_AUTHOR_NAMES.some((entry) =>
    authorName.includes(normalizeText(entry)),
  );
};

const isPokemonCategory = (name) => {
  const normalized = String(name || "").toLowerCase();
  return (
    normalized.includes("pokemon") ||
    normalized.includes("tcg") ||
    normalized.includes("pok")
  );
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    fetch(`${BASE_URL}v2/categories?per_page=100`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  useEffect(() => {
    let url = `${BASE_URL}v2/posts?_embed&orderby=date&order=desc&per_page=100`;

    if (selectedCategory) {
      url += `&categories=${selectedCategory}`;
    }

    setLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          setPageCount(0);
          setPosts([]);
          return [];
        }
        return response.json();
      })
      .then((data) => {
        const rawPosts = Array.isArray(data) ? data : [];
        const ownPosts = rawPosts.filter((post) => isMyPost(post));

        setPosts(ownPosts);
        setPageCount(Math.ceil(ownPosts.length / POSTS_PER_PAGE));
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const pagedPosts = useMemo(() => {
    const start = currentPage * POSTS_PER_PAGE;
    return posts.slice(start, start + POSTS_PER_PAGE);
  }, [posts, currentPage]);

  const pokemonCategories = useMemo(
    () => categories.filter((category) => isPokemonCategory(category.name)),
    [categories],
  );

  const selectedCategoryName = pokemonCategories.find(
    (category) => String(category.id) === String(selectedCategory),
  )?.name;

  return (
    <>
      <SEO
        title={
          selectedCategoryName
            ? `Pokemon Blog - ${selectedCategoryName}`
            : "Pokemon Blog"
        }
        description="Originalne Pokemon i Pokemon TCG teme objavljene kroz tvoj WordPress blog."
      />

      {loading && <Loader />}

      <div className="blog-page pokemon-blog-page">
        <div className="container">
          <header className="pokemon-blog-header">
            <p>News Hub</p>
            <h1>Pokemon Blog & Trendovi</h1>
          </header>

          <section className="pokemon-blog-filters">
            <div className="pokemon-blog-filter-group">
              <button
                type="button"
                className={`btn btn-sm ${
                  selectedCategory === "" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setSelectedCategory("")}
              >
                Sve kategorije
              </button>

              {pokemonCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`btn btn-sm ${
                    String(selectedCategory) === String(category.id)
                      ? "btn-dark"
                      : "btn-outline-dark"
                  }`}
                  onClick={() => setSelectedCategory(String(category.id))}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {posts.length === 0 && !loading && (
            <div className="pokemon-blog-empty">
              Nema objava za odabranu kategoriju. Ovdje prikazujemo samo tvoje
              originalne Pokemon teme.
            </div>
          )}

          <div className="row">
            {pagedPosts.map((post) => (
              <BlogPost key={post.id} post={post} />
            ))}
          </div>

          {pageCount > 1 && (
            <ReactPaginate
              previousLabel={"previous"}
              nextLabel={"next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={2}
              onPageChange={(event) => {
                setCurrentPage(event.selected);
                window.scrollTo({ top: 0, behavior: "smooth" });
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
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
