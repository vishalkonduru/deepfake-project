import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
  },
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default client
