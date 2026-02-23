import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import "./admin.css";

const AdminLayout = ({}) => {
  const location = useLocation();
  const path = location.pathname;


  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <div className="container">
      <div className="naslovna"></div>
      <div className="row">
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-3 position-relative">
              {" "}
              <div className="profile-pic">
                <img src="https://i.pravatar.cc/300" />
              </div>
            </div>
            <div className="col-md-9">
              <h1>Settings</h1>
            </div>
          </div>
        </div>
        <div className="col-md-6 px-3 py-3 d-flex justify-content-end gap-2">
          <button className="btn btn-info">Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 ">
          <ul>
            <li>
              <Link to="mydetails" className={`${path === "/admin/mydetails" ? "text-danger" : ""}`}>My details</Link>
            </li>
            <li>
              <Link to="myposts" className={`${path === "/admin/myposts" ? "text-danger" : ""}`}>My posts</Link>
            </li>
            <li>
              <Link to="mysettings" className={`${path === "/admin/mysettings" ? "text-danger" : ""}`}>My settings</Link>
            </li>
          </ul>
        </div>
      </div>
      <Outlet />
    </div>
  );
};
export default AdminLayout;
