// Authentication utilities and route guards

function getToken() {
    return localStorage.getItem("jwt_token");
}

function setToken(token) {
    localStorage.setItem("jwt_token", token);
}

function removeToken() {
    localStorage.removeItem("jwt_token");
}

function getUserInfo() {
    const userStr = localStorage.getItem("user_info");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function setUserInfo(user) {
    localStorage.setItem("user_info", JSON.stringify(user));
}

function removeUserInfo() {
    localStorage.removeItem("user_info");
}

function getRole() {
    const user = getUserInfo();
    return user ? user.role : null;
}

function logout() {
    removeToken();
    removeUserInfo();
    window.location.href = "login.html";
}

// Page Guard - run immediately on script load for protected pages
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    
    const role = getRole();
    const currentPath = window.location.pathname.toLowerCase();
    
    // Page level blocking
    if (role === 'Doctor' && (currentPath.includes('doctors.html') || currentPath.includes('patients.html'))) {
        window.location.href = "dashboard.html";
        return;
    }
    
    if (role === 'Patient' && currentPath.includes('patients.html')) {
        window.location.href = "dashboard.html";
        return;
    }
    
    // UI Role-based hiding
    document.addEventListener("DOMContentLoaded", () => {
        applyRoleRestrictions();
        
        // Setup logout button if it exists
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
}

function applyRoleRestrictions() {
    const role = getRole();
    
    const doctorsLink = document.getElementById("nav-doctors");
    const patientsLink = document.getElementById("nav-patients");
    const adminLink = document.getElementById("nav-dashboard"); // Used for admin-only if needed

    // Hide/Show based on roles
    if (role === 'Doctor') {
        if (doctorsLink) doctorsLink.style.display = 'none';
        if (patientsLink) patientsLink.style.display = 'none';
    } else if (role === 'Patient') {
        if (patientsLink) patientsLink.style.display = 'none';
    } else if (role === 'Admin') {
        // Admin sees everything
    }
}
