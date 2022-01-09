import axios from 'axios';
import {BASE_URL} from "../constants/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

axios.defaults.baseURL = BASE_URL;
axios.defaults.timeout = 25000;

export const publicRequest = axios.create({
    baseURL: BASE_URL,
});

export const privateRequest = axios.create({
    baseURL: BASE_URL
});

privateRequest.interceptors.request.use(async (config) => {
    const auth = JSON.parse(await AsyncStorage.getItem("@AuthData"));
    const TOKEN = auth && auth['token'] ? auth['token'] : "";
    config.headers.Authorization = TOKEN ? `Bearer ${TOKEN}` : '';
    return config;
}, (error) => Promise.reject(error));
