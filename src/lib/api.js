/**
 * Edvexa API Client Service
 * Centralized HTTP request handling with JWT Bearer token injection
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("edvexa_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error = new Error(
        data?.message || `Request failed with status ${res.status}`
      );
      error.status = res.status;
      error.details = data?.details;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || "GET"}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData) =>
      request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    me: () => request("/api/auth/me"),
    google: (profileData) =>
      request("/api/auth/google", {
        method: "POST",
        body: JSON.stringify(profileData),
      }),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const qs = query.toString();
      return request(`/api/products${qs ? `?${qs}` : ""}`);
    },
    getCategories: () => request("/api/products/categories"),
    getById: (id) => request(`/api/products/${id}`),
    create: (data) =>
      request("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/api/products/${id}`, {
        method: "DELETE",
      }),
  },

  // Inventory (Admin Only)
  inventory: {
    getInventory: () => request("/api/inventory"),
    adjustStock: (productId, operation, amount) =>
      request("/api/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({ productId, operation, amount }),
      }),
    getLowStock: (threshold = 5) =>
      request(`/api/inventory/low-stock?threshold=${threshold}`),
  },

  // Orders
  orders: {
    create: (orderData, idempotencyKey) => {
      const headers = {};
      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }
      return request("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });
    },
    getMyOrders: () => request("/api/orders/my-orders"),
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, val);
        }
      });
      const qs = query.toString();
      return request(`/api/orders${qs ? `?${qs}` : ""}`);
    },
    getById: (id) => request(`/api/orders/${id}`),
    updateStatus: (id, status, note) =>
      request(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }),
    cancel: (id, reason) =>
      request(`/api/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },
};
