const API_BASE_URL = "http://localhost:5024/api";

// Utility function to show toast messages
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'toast-container';
        document.body.appendChild(div);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Wrapper around fetch to automatically include Authorization header
async function fetchWithAuth(url, options = {}) {
    // Make sure headers object exists
    if (!options.headers) {
        options.headers = {};
    }
    
    // Add token to headers if it exists
    const token = typeof getToken !== 'undefined' ? getToken() : null;
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Default content type for JSON
    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    try {
        const response = await fetch(url, options);
        
        // Handle unauthorized (session expired / invalid token)
        if (response.status === 401) {
            showToast("Session expired. Please login again.", "error");
            if (typeof logout === 'function') {
                setTimeout(() => logout(), 1500);
            }
            throw new Error("Unauthorized");
        }
        
        // Handle forbidden (wrong role)
        if (response.status === 403) {
            showToast("You do not have permission to perform this action.", "error");
            throw new Error("Forbidden");
        }
        
        return response;
    } catch (error) {
        console.error("API Request Error:", error);
        throw error;
    }
}
