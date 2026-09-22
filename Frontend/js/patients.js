// Run auth check
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    fetchPatients();

    document.getElementById('patientForm').addEventListener('submit', handleFormSubmit);
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            searchPatients(searchTerm);
        } else {
            fetchPatients();
        }
    });
});

async function fetchPatients() {
    toggleLoader(true);
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/patient`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        const patients = await response.json();
        renderTable(patients);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoader(false);
    }
}

async function searchPatients(name) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/patient/search?name=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error('Search failed');
        const patients = await response.json();
        renderTable(patients);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderTable(patients) {
    const tbody = document.getElementById('patientsTableBody');
    const table = document.getElementById('patientsTable');
    const emptyState = document.getElementById('empty-state');
    
    tbody.innerHTML = '';
    
    if (patients.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    emptyState.style.display = 'none';
    
    patients.forEach(patient => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.disease}</td>
            <td>${patient.phone}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editPatient(${patient.id})">Edit</button>
                <button class="btn btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(patientId = null) {
    const modal = document.getElementById('patientModal');
    const form = document.getElementById('patientForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('patientId').value = '';
    
    if (patientId) {
        title.textContent = 'Edit Patient';
        fetchPatientDetails(patientId);
    } else {
        title.textContent = 'Add Patient';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('patientModal').classList.remove('active');
}

async function fetchPatientDetails(id) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/patient/${id}`);
        if (!response.ok) throw new Error('Failed to fetch patient details');
        const patient = await response.json();
        
        document.getElementById('patientId').value = patient.id;
        document.getElementById('name').value = patient.name;
        document.getElementById('age').value = patient.age;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('disease').value = patient.disease;
        document.getElementById('phone').value = patient.phone;
    } catch (error) {
        showToast(error.message, 'error');
        closeModal();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('patientId').value;
    const patientData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        disease: document.getElementById('disease').value,
        phone: document.getElementById('phone').value
    };
    
    try {
        let response;
        if (id) {
            // Update
            patientData.id = parseInt(id);
            response = await fetchWithAuth(`${API_BASE_URL}/patient/${id}`, {
                method: 'PUT',
                body: JSON.stringify(patientData)
            });
        } else {
            // Create
            response = await fetchWithAuth(`${API_BASE_URL}/patient`, {
                method: 'POST',
                body: JSON.stringify(patientData)
            });
        }
        
        if (!response.ok) throw new Error('Failed to save patient');
        
        showToast(id ? 'Patient updated successfully' : 'Patient added successfully');
        closeModal();
        fetchPatients();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/patient/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete patient');
        
        showToast('Patient deleted successfully');
        fetchPatients();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function toggleLoader(show) {
    const loader = document.getElementById('loader');
    const table = document.getElementById('patientsTable');
    if (show) {
        loader.style.display = 'block';
        table.style.display = 'none';
    } else {
        loader.style.display = 'none';
    }
}
