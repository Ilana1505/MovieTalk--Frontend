import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000', 
  withCredentials: true, // Include credentials (cookies) in requests
});

export default instance;
