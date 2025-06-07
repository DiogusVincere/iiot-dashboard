import axios, { AxiosHeaders } from "axios";

export const BASE_URL = '/spaces/tqsnwogyan0s/environments/master';

export const getCdnAxios = (headers?: AxiosHeaders) => {
    const token = import.meta.env.VITE_CONTENTFUL_CDN_TOKEN;
    if (!token) throw new Error('Contentful CDN token is not defined');
    return getAxios("cdn", token, headers);
};

export const getApiAxios = (headers?: AxiosHeaders) => {
    const token = import.meta.env.VITE_CONTENTFUL_API_TOKEN;
    if (!token) throw new Error('Contentful API token is not defined');
    return getAxios("api", token, headers);
};

const getAxios = (target: 'cdn'|'api', token: string, headers?: AxiosHeaders) => {
    const instance = axios.create({
        baseURL: `https://${target}.contentful.com/spaces/tqsnwogyan0s/environments/master`,
        timeout: 10000,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': target === 'api' 
                ? 'application/vnd.contentful.management.v1+json' 
                : 'application/json',
            ...headers?.toJSON()
        }
    });

    instance.interceptors.response.use(
        response => response.data,
        error => {
            console.error('API Error:', error);
            return Promise.reject(error);
        }
    );

    return instance;
};