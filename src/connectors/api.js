const apiUrl = 'http://127.0.0.1:8000';
// const apiUrl = window.location.origin;

const http = {
    get: async (endpoint) => {
        const response = await fetch(`${apiUrl}${endpoint}`);
        return await response.json();
    },
    
    post: async (endpoint, data) => {
        const body = JSON.stringify(data)
        console.log("POST", endpoint, body)
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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
    
    put: async (endpoint, data) => {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    delete: async (endpoint) => {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
};

const ApiClient = (object_name) => {
    return ({
        get_all: async () => await http.get(`/${object_name}/list`),
        get_by_id: async (id_param) => await http.get(`/${object_name}/get/${id_param}`),
        get_history: async (id_param) => await http.get(`/${object_name}/get_history/${id_param}`),
        get_tables: async () => await http.get(`/${object_name}/table`),
        create: async (data) => await http.post(`/${object_name}/new`, data),
        edit: async (id_param, data) => await http.put(`/${object_name}/edit/${id_param}`, data),
        delete: async (id_param) => await http.delete(`/${object_name}/delete/${id_param}`)
    })
}
const get_json_schema = async () => await http.get(`/get_json_schema`)

export {ApiClient, get_json_schema}