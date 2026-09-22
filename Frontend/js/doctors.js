// Run auth check
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    fetchDoctors();

    document.getElementById('doctorForm').addEventListener('submit', handleFormSubmit);
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            searchDoctors(searchTerm);
        } else {
            fetchDoctors();
        }
    });
});

async function fetchDoctors() {
    toggleLoader(true);
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/doctor`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        const doctors = await response.json();
        renderTable(doctors);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoader(false);
    }
}

async function searchDoctors(name) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/doctor/search?name=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error('Search failed');
        const doctors = await response.json();
        renderTable(doctors);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderTable(doctors) {
    const tbody = document.getElementById('doctorsTableBody');
    const table = document.getElementById('doctorsTable');
    const emptyState = document.getElementById('empty-state');
    
    tbody.innerHTML = '';
    
    if (doctors.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    emptyState.style.display = 'none';
    
    doctors.forEach(doctor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doctor.id}</td>
            <td>${doctor.name}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.email}</td>
            <td>${doctor.phone}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editDoctor(${doctor.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteDoctor(${doctor.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(doctorId = null) {
    const modal = document.getElementById('doctorModal');
    const form = document.getElementById('doctorForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('doctorId').value = '';
    
    if (doctorId) {
        title.textContent = 'Edit Doctor';
        fetchDoctorDetails(doctorId);
    } else {
        title.textContent = 'Add Doctor';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('doctorModal').classList.remove('active');
}

async function fetchDoctorDetails(id) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/doctor/${id}`);
        if (!response.ok) throw new Error('Failed to fetch doctor details');
        const doctor = await response.json();
        
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('name').value = doctor.name;
        document.getElementById('specialization').value = doctor.specialization;
        document.getElementById('email').value = doctor.email;
        document.getElementById('phone').value = doctor.phone;
    } catch (error) {
        showToast(error.message, 'error');
        closeModal();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('doctorId').value;
    const doctorData = {
        name: document.getElementById('name').value,
        specialization: document.getElementById('specialization').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    try {
        let response;
        if (id) {
            // Update
            doctorData.id = parseInt(id);
            response = await fetchWithAuth(`${API_BASE_URL}/doctor/${id}`, {
                method: 'PUT',
                body: JSON.stringify(doctorData)
            });
        } else {
            // Create
            response = await fetchWithAuth(`${API_BASE_URL}/doctor`, {
                method: 'POST',
                body: JSON.stringify(doctorData)
            });
        }
        
        if (!response.ok) throw new Error('Failed to save doctor');
        
        showToast(id ? 'Doctor updated successfully' : 'Doctor added successfully');
        closeModal();
        fetchDoctors();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/doctor/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete doctor');
        
        showToast('Doctor deleted successfully');
        fetchDoctors();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function toggleLoader(show) {
    const loader = document.getElementById('loader');
    const table = document.getElementById('doctorsTable');
    if (show) {
        loader.style.display = 'block';
        table.style.display = 'none';
    } else {
        loader.style.display = 'none';
    }
}
