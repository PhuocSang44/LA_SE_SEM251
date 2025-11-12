import axios from 'axios';

export const api = axios.create({
    // Your backend's base URL
    baseURL: 'http://localhost:10001',

    // THIS IS THE MOST IMPORTANT PART
    // It tells Axios to send cookies (like your session cookie)
    // with every request.
    withCredentials: true,
    // xsrfHeaderName: 'X-CSRF-TOKEN'
});
