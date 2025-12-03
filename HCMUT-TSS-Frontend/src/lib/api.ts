import axios from 'axios';

export const api = axios.create({
    // Use environment variable, fallback to localhost for development
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10001',

    // THIS IS THE MOST IMPORTANT PART
    // It tells Axios to send cookies (like your session cookie)
    // with every request.
    withCredentials: true,
    // xsrfHeaderName: 'X-CSRF-TOKEN'
});
