//const apiUrl = 'http://127.0.0.1:8000';
const apiUrl = window.location.origin;
import Cookies from 'universal-cookie';
const cookies = new Cookies(null, { path: '/' });

const http = {
    get: async (endpoint, headers_param = {}) => {
        const headers = {
            'Content-Type': 'application/json'
            ,...headers_param
        }
        if (cookies.get('token')) {
            headers['Authorization'] = `Bearer ${cookies.get('token')}`
        }
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const error = new Error(`HTTP error ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.headers = Object.fromEntries(response.headers.entries());
            error.data = errorData;
            throw error;
        }
        return await response.json();
    },
    
    post: async (endpoint, data, headers_param={}) => {
        let body = data
        if (!(data instanceof URLSearchParams)) {
            body = JSON.stringify(data)
        }
        const headers = {
            'Content-Type': 'application/json'
            ,...headers_param
        }
        if (cookies.get('token')) {
            headers['Authorization'] = `Bearer ${cookies.get('token')}`
        }
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: body
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const error = new Error(`HTTP error ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.headers = Object.fromEntries(response.headers.entries());
            error.data = errorData;
            throw error;
        }
        return await response.json();
    },
    
    put: async (endpoint, data, headers_param = {}) => {
        let body = data
        if (!(data instanceof URLSearchParams)) {
            body = JSON.stringify(data)
        }
        const headers = {
            'Content-Type': 'application/json'
            ,...headers_param
        }
        if (cookies.get('token')) {
            headers['Authorization'] = `Bearer ${cookies.get('token')}`
        }
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
            headers: headers,
            body: body
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const error = new Error(`HTTP error ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.headers = Object.fromEntries(response.headers.entries());
            error.data = errorData;
            throw error;
        }
        return await response.json();
    },
    
    delete: async (endpoint, headers_param = {}) => {
        const headers = {
            ...headers_param
        }
        if (cookies.get('token')) {
            headers['Authorization'] = `Bearer ${cookies.get('token')}`
        }
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const error = new Error(`HTTP error ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.headers = Object.fromEntries(response.headers.entries());
            error.data = errorData;
            throw error;
        }
        return await response.json();
    }
};

const prefix = '/autodla-admin/'
const ApiClient = (object_name) => {
    return ({
        get_all: async () => await http.get(`${prefix}${object_name}/list`),
        get_by_id: async (id_param) => await http.get(`${prefix}${object_name}/get/${id_param}`),
        get_history: async (id_param) => await http.get(`${prefix}${object_name}/get_history/${id_param}`),
        get_tables: async () => await http.get(`${prefix}${object_name}/table`),
        create: async (data) => await http.post(`${prefix}${object_name}/new`, data),
        edit: async (id_param, data) => await http.put(`${prefix}${object_name}/edit/${id_param}`, data),
        delete: async (id_param) => await http.delete(`${prefix}${object_name}/delete/${id_param}`)
    })
}
const get_json_schema = async () => await http.get(`${prefix}admin/get_json_schema`)
const auth = async (user, password) => await http.post(`${prefix}admin/token`, new URLSearchParams({'username': user,'password': password,'grant_type': 'password'}) ,{'Content-Type': 'application/x-www-form-urlencoded'})

export {ApiClient, get_json_schema, cookies, auth}