const API_BASE_URL = 'http://localhost:5024';

// Elements
const patientForm = document.getElementById('patientForm');
const patientsTableBody = document.getElementById('patientsTableBody');
const messageBox = document.getElementById('messageBox');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const searchInput = document.getElementById('searchInput');

// Load patients on page load
document.addEventListener('DOMContentLoaded', fetchPatients);

// Handle form submission for Add/Update
patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('patientId').value;
    const patient = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        disease: document.getElementById('disease').value,
        phone: document.getElementById('phone').value
    };

    if (id) {
        await updatePatient(id, patient);
    } else {
        await addPatient(patient);
    }
});

// Fetch all patients
async function fetchPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/patient`);
        if (!response.ok) throw new Error('Failed to fetch patients.');
        
        const patients = await response.json();
        renderTable(patients);
        searchInput.value = '';
    } catch (error) {
        showMessage(error.message, 'error');
        patientsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error loading patients.</td></tr>`;
    }
}

// Search patients
async function searchPatients() {
    const query = searchInput.value.trim();
    if (!query) {
        fetchPatients();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/patient/search?name=${encodeURIComponent(query)}`);
        
        if (response.status === 404) {
            renderTable([]);
            showMessage('No patients found.', 'error');
            return;
        }
        
        if (!response.ok) throw new Error('Search failed.');
        
        const patients = await response.json();
        renderTable(patients);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Render patients table
function renderTable(patients) {
    patientsTableBody.innerHTML = '';

    if (patients.length === 0) {
        patientsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No patients found.</td></tr>`;
        return;
    }

    patients.forEach(patient => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${patient.id}</td>
            <td><strong>${patient.name}</strong></td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.disease}</td>
            <td>${patient.phone}</td>
            <td class="actions-cell">
                <button class="btn btn-primary btn-sm" onclick="editPatient(${patient.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})">Delete</button>
            </td>
        `;
        patientsTableBody.appendChild(tr);
    });
}

// Add a new patient
async function addPatient(patient) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/patient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patient)
        });

        if (!response.ok) throw new Error('Failed to add patient.');
        
        const data = await response.json();
        showMessage(data.message || 'Patient added successfully!', 'success');
        
        resetForm();
        fetchPatients();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Prepare form for editing
async function editPatient(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/patient/${id}`);
        if (!response.ok) throw new Error('Failed to fetch patient details.');
        
        const patient = await response.json();
        
        document.getElementById('patientId').value = patient.id;
        document.getElementById('name').value = patient.name;
        document.getElementById('age').value = patient.age;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('disease').value = patient.disease;
        document.getElementById('phone').value = patient.phone;
        
        formTitle.innerText = 'Update Patient';
        saveBtn.innerText = 'Update Patient';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Update existing patient
async function updatePatient(id, patient) {
    patient.id = parseInt(id);

    try {
        const response = await fetch(`${API_BASE_URL}/api/patient/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patient)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to update patient.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Patient updated successfully!', 'success');
        
        resetForm();
        fetchPatients();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Delete patient
async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/patient/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to delete patient.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Patient deleted successfully!', 'success');
        
        fetchPatients();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Reset form
function resetForm() {
    patientForm.reset();
    document.getElementById('patientId').value = '';
    formTitle.innerText = 'Add New Patient';
    saveBtn.innerText = 'Save Patient';
}

// Show success or error message
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    
    setTimeout(() => {
        messageBox.className = 'message';
    }, 5000);
}
