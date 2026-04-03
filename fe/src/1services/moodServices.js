import axios from "./api.js";

const getMoods = async(year) => {
    return axios.get(`/api/moods?year=${year}`);
}

const saveMoods = async(year, moodsData) => {
    return axios.post('/api/moods', { year: year, moods: moodsData });
}

export { getMoods, saveMoods };