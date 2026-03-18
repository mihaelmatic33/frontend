import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import "./admin.css";

const BASE_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/";

const AdminLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetch(`${BASE_URL}users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, [navigate]);

  const avatarUrl =
    localStorage.getItem("userAvatar") ||
    user?.avatar_urls?.["96"] ||
    "https://i.pravatar.cc/300";

  return (
    <div className="container">
      <div className="naslovna"></div>
      <div className="row">
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-3 position-relative">
              {" "}
              <div className="profile-pic">
                <img src={avatarUrl} alt="Profile avatar" />
              </div>
            </div>
            <div className="col-md-9">
              <h1>Settings</h1>
              {user && (
                <p className="admin-welcome">
                  {user.first_name || user.name || ""}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 px-3 py-3 d-flex justify-content-end gap-2">
          <button className="btn cancel-btn">Cancel</button>
          <button className="btn save-btn">Save</button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <ul className="admin-links">
            <li>
              <Link
                to="mydetails"
                className={`${path === "/admin/mydetails" ? "text-danger" : ""}`}
              >
                My Details
              </Link>
            </li>
            <li>
              <Link
                to="shophistory"
                className={`${path === "/admin/shophistory" ? "text-danger" : ""}`}
              >
                Shop History
              </Link>
            </li>
            <li>
              <Link
                to="mysettings"
                className={`${path === "/admin/mysettings" ? "text-danger" : ""}`}
              >
                My Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <Outlet />
    </div>
  );
};
export default AdminLayout;
