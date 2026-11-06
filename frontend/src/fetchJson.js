import axios from 'axios'

const fetchJson = async (url) => {
    try {
        const formData = new FormData()
        formData.append('images', url) 
        const response = await axios.post('http://localhost:3000/api/analyze-image', formData)
        return response.data
    }
    catch(e) {
        console.error("Server 400 details:", e.response?.data || e.message)
        throw e
    }
}

export default fetchJson