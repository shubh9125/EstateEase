window.SERVER_URL = "http://localhost:5000";
window.API_BASE = window.SERVER_URL + "/api";

console.log("API_BASE initialized:", window.API_BASE);

// Robust image URL helper with debugging
window.getPropertyImageUrl = function(img) {
    if (!img) return "https://placehold.co/600x420/d1d5db/475569?text=No+Image";
    if (img.startsWith("http")) return img;
    
    var server = window.SERVER_URL || "http://localhost:5000";
    var path = img;
    
    // If the image path doesn't already include 'uploads', add the prefix
    if (path.indexOf("uploads") === -1) {
        path = "/uploads/properties/" + (path.startsWith("/") ? path.substring(1) : path);
    } else {
        path = path.startsWith("/") ? path : "/" + path;
    }
    
    var finalUrl = server + path;
    console.log(`[Image URL] Original: ${img} -> Final: ${finalUrl}`);
    return finalUrl;
};

// Use local variables for internal usage
var SERVER_URL = window.SERVER_URL;
var API_BASE = window.API_BASE;

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
    if (!res.ok) {
        const errorMsg = data.message || data.error || `API error: ${res.status} ${res.statusText}`;
        throw new Error(errorMsg);
    }
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
    if (!res.ok) {
        const errorMsg = data.message || data.error || `API error: ${res.status} ${res.statusText}`;
        throw new Error(errorMsg);
    }
    return data;
}