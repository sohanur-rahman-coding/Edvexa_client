/**
 * Edvexa API Client Service (TypeScript)
 * Centralized HTTP request handling with JWT Bearer token injection
 */

import { ApiResponse, Product, Order, User, InventoryStats, OrderStats } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("edvexa_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error: any = new Error(
        data?.message || `Request failed with status ${res.status}`
      );
      error.status = res.status;
      error.details = data?.details;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error(`API Error on [${options.method || "GET"}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    register: (userData: { name: string; email: string; password: string; role?: string }) =>
      request<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    login: (credentials: { email: string; password: string }) =>
      request<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    me: () => request<{ user: User }>("/api/auth/me"),
    google: (profileData: any) =>
      request<{ user: User; token: string }>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify(profileData),
      }),
  },

  // Products
  products: {
    getAll: (params: Record<string, string | number | boolean | undefined> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
      const qs = query.toString();
      return request<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
    },
    getCategories: () => request<string[]>("/api/products/categories"),
    getById: (id: string) => request<Product>(`/api/products/${id}`),
    create: (data: Partial<Product>) =>
      request<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Product>) =>
      request<Product>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ id: string; title: string }>(`/api/products/${id}`, {
        method: "DELETE",
      }),
  },

  // Inventory (Admin Only)
  inventory: {
    getInventory: () =>
      request<Product[]>("/api/inventory") as Promise<
        ApiResponse<Product[]> & { stats: InventoryStats }
      >,
    adjustStock: (productId: string, operation: "add" | "set" | "deduct", amount: number) =>
      request<{ product: Product; previousStock: number; newStock: number }>(
        "/api/inventory/adjust",
        {
          method: "POST",
          body: JSON.stringify({ productId, operation, amount }),
        }
      ),
    getLowStock: (threshold = 5) =>
      request<Product[]>(`/api/inventory/low-stock?threshold=${threshold}`),
  },

  // Orders
  orders: {
    createPaymentIntent: (data: { amount: number; currency?: string; items?: any[]; idempotencyKey?: string }) =>
      request<{ clientSecret: string; publishableKey: string; isSimulated: boolean; message?: string }>(
        "/api/orders/create-payment-intent",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    create: (orderData: any, idempotencyKey?: string) => {
      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }
      return request<Order>("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });
    },
    getMyOrders: () => request<Order[]>("/api/orders/my-orders"),
    getAll: (params: Record<string, string | number | undefined> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
      const qs = query.toString();
      return request<Order[]>(`/api/orders${qs ? `?${qs}` : ""}`) as Promise<
        ApiResponse<Order[]> & { stats: OrderStats }
      >;
    },
    getById: (id: string) => request<Order>(`/api/orders/${id}`),
    updateStatus: (id: string, status: string, note?: string) =>
      request<Order>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }),
    cancel: (id: string, reason?: string) =>
      request<{ order: Order; restoredCount: number }>(`/api/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },
};
