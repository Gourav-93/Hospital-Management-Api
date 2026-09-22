// Run auth check
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

async function loadDashboardData() {
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('error-message');
    const dashboardCards = document.getElementById('dashboard-cards');

    try {
        // Use fetchWithAuth wrapper instead of regular fetch
        const response = await fetchWithAuth(`${API_BASE_URL}/dashboard`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Update DOM with data
        document.getElementById('totalDoctors').textContent = data.totalDoctors || 0;
        document.getElementById('totalPatients').textContent = data.totalPatients || 0;
        document.getElementById('totalAppointments').textContent = data.totalAppointments || 0;
        document.getElementById('pendingAppointments').textContent = data.pendingAppointments || 0;
        document.getElementById('confirmedAppointments').textContent = data.confirmedAppointments || 0;
        document.getElementById('completedAppointments').textContent = data.completedAppointments || 0;
        
        // Hide loader, show data
        loader.style.display = 'none';
        dashboardCards.style.display = 'grid';
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        loader.style.display = 'none';
        
        // Avoid overwriting a 401/403 toast with a generic error
        if (error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
            errorMsg.textContent = 'Failed to load dashboard data. Please make sure the API is running.';
            errorMsg.style.display = 'block';
        }
    }
}
