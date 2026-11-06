import axios from 'axios'
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const fetchJson = async (url) => {
    try {
        const formData = new FormData()
        formData.append('images', url) 
        const response = await axios.post(`${API_BASE_URL}`, formData)
        return response.data
    }
    catch(e) {
        console.error("Server 400 details:", e.response?.data || e.message)
        throw e
    }
}

export default fetchJson