import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import ReactPaginate from "react-paginate";
import BlogPost from "../components/BlogPost";
import SwiperComponent from "../components/SwiperComponent";
import SEO from "../components/SEO";
import "./Blog.css";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://front2.edukacija.online/backend/wp-json/wp/";

const SOURCE_FILTERS = [
  { key: "all", label: "Sve novosti" },
  { key: "pokemon-official", label: "Pokemon Official" },
  { key: "pokemon-tcg-official", label: "Pokemon TCG Official" },
];

const SOURCE_SEARCH = {
  all: "",
  "pokemon-official": "pokemon.com official news",
  "pokemon-tcg-official": "pokemon tcg official",
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
  const [selectedSource, setSelectedSource] = useState("all");
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
  }, [selectedSource, selectedCategory]);

  useEffect(() => {
    const perPage = 6;
    let url = `${BASE_URL}v2/posts?_embed&orderby=date&order=desc&per_page=${perPage}&page=${currentPage + 1}`;

    if (selectedCategory) {
      url += `&categories=${selectedCategory}`;
    }

    if (selectedSource !== "all") {
      url += `&search=${encodeURIComponent(SOURCE_SEARCH[selectedSource])}`;
    }

    setLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          setPageCount(0);
          setPosts([]);
          return [];
        }

        const totalPages = Number(response.headers.get("X-WP-TotalPages") || 1);
        setPageCount(totalPages);
        return response.json();
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSource, currentPage]);

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
        description="Najnovije Pokemon i Pokemon TCG novosti koje se povlace preko WordPress API-ja."
      />

      {loading && <Loader />}

      <div className="blog-page pokemon-blog-page">
        <div className="container">
          <header className="pokemon-blog-header">
            <p>News Hub</p>
            <h1>Pokemon Blog & Novosti</h1>
            <span>
              Sadrzaj se povlaci preko tvog WordPress API-ja, uz source filtere
              za Pokemon Official i Pokemon TCG Official.
            </span>
          </header>

          {posts.length > 0 && <SwiperComponent posts={posts} />}

          <section className="pokemon-blog-filters">
            <div className="pokemon-blog-filter-group">
              {SOURCE_FILTERS.map((source) => (
                <button
                  type="button"
                  key={source.key}
                  className={`btn btn-sm ${
                    selectedSource === source.key
                      ? "btn-warning"
                      : "btn-outline-dark"
                  }`}
                  onClick={() => setSelectedSource(source.key)}
                >
                  {source.label}
                </button>
              ))}
            </div>

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
              Nema objava za odabrani filter. Ako zelis official feed, importaj
              Pokemon/Pokemon TCG vijesti u WordPress i ova stranica ce ih odmah
              prikazati kroz API.
            </div>
          )}

          <div className="row">
            {posts.map((post) => (
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
