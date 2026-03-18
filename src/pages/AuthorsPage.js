import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJsonCached } from "../utils/httpCache";

const AuthorsPage = () => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let active = true;

    fetchJsonCached(
      "https://front2.edukacija.online/backend/wp-json/wp/v2/users",
      {
        cacheKey: "authors_page_users",
        ttlMs: 30 * 60 * 1000,
      },
    )
      .then((data) => {
        if (active) {
          setAuthors(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setAuthors([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Naši Autori</h1>

      <div className="row">
        {authors.map((author) => (
          <div key={author.id} className="col-md-4 mb-4">
            <Link
              to={`/autori/${author.id}`}
              className="text-decoration-none text-dark"
            >
              <div className="card shadow-sm p-3">
                <h5>{author.name}</h5>
                <p>{author.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorsPage;
