const API_BASE= "http://localhost:5000/api";

function getToken() {
    return localStorage.getItem("token");
}

async function api(path, method = "GET", body = null) {
    const headers = {
        "Content-Type": "application/json",
    };
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

   const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "API error");
    return data;
}

async function apiFormData(path, method = "POST", formData) {
    const headers = {};
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "API error");
    return data;
}