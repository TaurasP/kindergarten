import axios from 'axios';
import { User } from '../models/User';

const API_URL = 'http://localhost:8080/auth/';

const register = (registerRequest: { email: string; password: string; confirmPassword: string }) => {
    return axios.post(API_URL + 'register', registerRequest);
};

const login = async (user: User): Promise<string> => {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  
    return response.text();
  };

export default {
    register,
    login
};