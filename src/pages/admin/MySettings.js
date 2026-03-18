import { useEffect, useState, useCallback } from "react";
import Toast from "../../components/Toast";

const BASE_URL = "https://front2.edukacija.online/backend/wp-json/wp/v2/";

const MySettings = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE_URL}users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          avatarUrl: localStorage.getItem("userAvatar") || "",
        }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeToast = useCallback(
    () => setToast((p) => ({ ...p, show: false })),
    [],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setToast({ show: true, message: "Passwords do not match." });
      return;
    }
    const token = localStorage.getItem("token");
    const body = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
    };
    if (form.password) body.password = form.password;
    try {
      const res = await fetch(`${BASE_URL}users/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      if (form.avatarUrl) {
        localStorage.setItem("userAvatar", form.avatarUrl);
      } else {
        localStorage.removeItem("userAvatar");
      }
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setToast({ show: true, message: "Profile updated successfully!" });
    } catch {
      setToast({
        show: true,
        message: "Could not update profile. Please try again.",
      });
    }
  };

  if (loading) return <div className="admin-details-loader">Loading...</div>;

  const previewAvatar = form.avatarUrl || "https://i.pravatar.cc/300";

  return (
    <div className="admin-settings">
      {toast.show && <Toast message={toast.message} onClose={closeToast} />}
      <form onSubmit={handleSubmit} className="admin-settings-form">
        <div className="admin-settings-section">
          <h5>Profile Picture</h5>
          <div className="admin-settings-avatar-preview">
            <img src={previewAvatar} alt="Avatar preview" />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="avatarUrl">
              Avatar URL
            </label>
            <input
              type="url"
              id="avatarUrl"
              name="avatarUrl"
              className="form-control"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="admin-settings-section">
          <h5>Personal Info</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="first_name">
                First name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-control"
                value={form.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="last_name">
                Last name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-control"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="admin-settings-section">
          <h5>Change Password</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="password">
                New password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
              />
            </div>
          </div>
        </div>

        <div className="admin-settings-actions">
          <button type="submit" className="btn save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default MySettings;
