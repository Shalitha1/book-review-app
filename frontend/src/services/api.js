import axios from "axios";

// In production, an empty base URL keeps requests on the public ALB so Nginx
// can proxy /api internally. Set NEXT_PUBLIC_API_URL only for local development.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 10000,
});

const messageFrom = (error, fallback) =>
  error.response?.data?.message || (error.code === "ECONNABORTED" ? "The request timed out" : fallback);

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const request = async (operation, fallback) => {
  try {
    const response = await operation();
    return response.data;
  } catch (error) {
    throw new Error(messageFrom(error, fallback));
  }
};

export const registerUser = (userData) =>
  request(() => api.post("/api/users/register", userData), "Registration failed");

export const loginUser = (userData) =>
  request(() => api.post("/api/users/login", userData), "Login failed");

export const fetchBooks = () =>
  request(() => api.get("/api/books"), "Failed to fetch books");

export const fetchBookDetails = (bookId) =>
  request(() => api.get(`/api/books/${bookId}`), "Failed to fetch book details");

export const fetchReviews = (bookId) =>
  request(() => api.get(`/api/reviews/${bookId}`), "Failed to fetch reviews");

export const submitReview = (reviewData) =>
  request(() => api.post("/api/reviews", reviewData), "Failed to submit review");

export const updateReview = (reviewId, reviewData) =>
  request(() => api.put(`/api/reviews/${reviewId}`, reviewData), "Failed to update review");

export const deleteReview = (reviewId) =>
  request(() => api.delete(`/api/reviews/${reviewId}`), "Failed to delete review");
