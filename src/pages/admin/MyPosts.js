import React from "react";

const MyPosts = () => {
  const orders = JSON.parse(localStorage.getItem("orderHistory") || "[]");

  if (orders.length === 0) {
    return (
      <div className="admin-shop-history">
        <p className="admin-empty">No orders placed yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-shop-history">
      {orders.map((order) => (
        <div key={order.id} className="admin-order-card">
          <div className="admin-order-header">
            <span className="admin-order-date">
              {new Date(order.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="admin-order-total">
              Total: {order.total.toFixed(2)} EUR
            </span>
          </div>
          <ul className="admin-order-items">
            {order.items.map((item, i) => (
              <li key={i} className="admin-order-item">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="admin-order-item__img"
                  />
                )}
                <div className="admin-order-item__info">
                  <span className="admin-order-item__title">{item.title}</span>
                  <span className="admin-order-item__meta">
                    {item.quantity} &times; {item.price.toFixed(2)} EUR
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="admin-order-delivery">
            <strong>Delivered to:</strong> {order.delivery.fullName},{" "}
            {order.delivery.address}, {order.delivery.city}{" "}
            {order.delivery.postalCode}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPosts;
