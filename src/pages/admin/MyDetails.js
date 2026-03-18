import { useEffect, useState } from "react";

const BASE_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/";

const MyDetails = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE_URL}users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-details-loader">Loading...</div>;
  if (!user)
    return <div className="admin-details-loader">Could not load profile.</div>;

  const avatarUrl =
    localStorage.getItem("userAvatar") ||
    user.avatar_urls?.["96"] ||
    "https://i.pravatar.cc/300";

  return (
    <div className="admin-details-card">
      <div className="admin-details-avatar">
        <img src={avatarUrl} alt="Avatar" />
      </div>
      <div className="admin-details-info">
        <div className="admin-details-row">
          <span className="admin-details-label">First name</span>
          <span className="admin-details-value">{user.first_name || "—"}</span>
        </div>
        <div className="admin-details-row">
          <span className="admin-details-label">Last name</span>
          <span className="admin-details-value">{user.last_name || "—"}</span>
        </div>
        <div className="admin-details-row">
          <span className="admin-details-label">Email</span>
          <span className="admin-details-value">{user.email || "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default MyDetails;
