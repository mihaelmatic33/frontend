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
const BLOG_CACHE_TTL_MS = 5 * 60 * 1000;
const BLOG_POSTS_CACHE_KEY = "blog_posts_cache_v1";
const BLOG_CATEGORIES_CACHE_KEY = "blog_categories_cache_v1";

const getCachedData = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !Array.isArray(parsed?.data)) {
      return null;
    }

    if (Date.now() - parsed.timestamp > BLOG_CACHE_TTL_MS) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const setCachedData = (key, data) => {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch {
    // Ignore storage errors (private mode / quota exceeded).
  }
};

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
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    const cachedPosts = getCachedData(BLOG_POSTS_CACHE_KEY);
    const cachedCategories = getCachedData(BLOG_CATEGORIES_CACHE_KEY);
    const hasCachedData =
      Array.isArray(cachedPosts) || Array.isArray(cachedCategories);

    if (Array.isArray(cachedPosts)) {
      setPosts(cachedPosts);
    }

    if (Array.isArray(cachedCategories)) {
      setCategories(cachedCategories);
    }

    setLoading(!hasCachedData);

    const controller = new AbortController();

    Promise.allSettled([
      fetch(`${BASE_URL}v2/categories?per_page=100&_fields=id,name`, {
        signal: controller.signal,
      }),
      fetch(`${BASE_URL}v2/posts?_embed&orderby=date&order=desc&per_page=100`, {
        signal: controller.signal,
      }),
    ])
      .then(async ([categoriesResult, postsResult]) => {
        if (categoriesResult.status === "fulfilled") {
          const categoriesResponse = categoriesResult.value;
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            const nextCategories = Array.isArray(categoriesData)
              ? categoriesData
              : [];
            setCategories(nextCategories);
            setCachedData(BLOG_CATEGORIES_CACHE_KEY, nextCategories);
          }
        }

        if (postsResult.status === "fulfilled") {
          const postsResponse = postsResult.value;
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            const nextPosts = Array.isArray(postsData) ? postsData : [];
            setPosts(nextPosts);
            setCachedData(BLOG_POSTS_CACHE_KEY, nextPosts);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  const ownPosts = useMemo(
    () => posts.filter((post) => isMyPost(post)),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return ownPosts;
    }

    const selectedCategoryId = Number(selectedCategory);
    return ownPosts.filter((post) =>
      Array.isArray(post?.categories)
        ? post.categories.includes(selectedCategoryId)
        : false,
    );
  }, [ownPosts, selectedCategory]);

  const pageCount = useMemo(
    () => Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
    [filteredPosts.length],
  );

  const pagedPosts = useMemo(() => {
    const start = currentPage * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

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
            <button
              type="button"
              className="pokemon-blog-filters__toggle"
              onClick={() => setCategoriesOpen((prev) => !prev)}
              aria-expanded={categoriesOpen}
            >
              {selectedCategory
                ? pokemonCategories.find(
                    (c) => String(c.id) === selectedCategory,
                  )?.name
                : "Sve kategorije"}
              <span
                className={`pokemon-blog-filters__arrow${
                  categoriesOpen ? " pokemon-blog-filters__arrow--open" : ""
                }`}
              >
                ▾
              </span>
            </button>

            <div
              className={`pokemon-blog-filter-group${
                categoriesOpen ? " pokemon-blog-filter-group--open" : ""
              }`}
            >
              <button
                type="button"
                className={`btn btn-sm ${
                  selectedCategory === "" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => {
                  setSelectedCategory("");
                  setCategoriesOpen(false);
                }}
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
                  onClick={() => {
                    setSelectedCategory(String(category.id));
                    setCategoriesOpen(false);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {filteredPosts.length === 0 && !loading && (
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
