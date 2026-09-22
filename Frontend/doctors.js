const API_BASE_URL = 'http://localhost:5024';

// Elements
const doctorForm = document.getElementById('doctorForm');
const doctorsTableBody = document.getElementById('doctorsTableBody');
const messageBox = document.getElementById('messageBox');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const searchInput = document.getElementById('searchInput');

// Load doctors on page load
document.addEventListener('DOMContentLoaded', fetchDoctors);

// Handle form submission for Add/Update
doctorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('doctorId').value;
    const doctor = {
        name: document.getElementById('name').value,
        specialization: document.getElementById('specialization').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    if (id) {
        await updateDoctor(id, doctor);
    } else {
        await addDoctor(doctor);
    }
});

// Fetch all doctors
async function fetchDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor`);
        if (!response.ok) throw new Error('Failed to fetch doctors. Is the backend running?');
        
        const doctors = await response.json();
        renderTable(doctors);
        searchInput.value = '';
    } catch (error) {
        showMessage(error.message, 'error');
        doctorsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading doctors. Check if backend (http://localhost:5024) is running and CORS is enabled.</td></tr>`;
    }
}

// Search doctors
async function searchDoctors() {
    const query = searchInput.value.trim();
    if (!query) {
        fetchDoctors();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor/search?name=${encodeURIComponent(query)}`);
        
        if (response.status === 404) {
            renderTable([]);
            showMessage('No doctors found.', 'error');
            return;
        }
        
        if (!response.ok) throw new Error('Search failed.');
        
        const doctors = await response.json();
        renderTable(doctors);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Render doctors table
function renderTable(doctors) {
    doctorsTableBody.innerHTML = '';

    if (doctors.length === 0) {
        doctorsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No doctors found.</td></tr>`;
        return;
    }

    doctors.forEach(doctor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doctor.id}</td>
            <td><strong>${doctor.name}</strong></td>
            <td>${doctor.specialization}</td>
            <td>${doctor.email}</td>
            <td>${doctor.phone}</td>
            <td class="actions-cell">
                <button class="btn btn-primary btn-sm" onclick="editDoctor(${doctor.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDoctor(${doctor.id})">Delete</button>
            </td>
        `;
        doctorsTableBody.appendChild(tr);
    });
}

// Add a new doctor
async function addDoctor(doctor) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctor)
        });

        if (!response.ok) throw new Error('Failed to add doctor.');
        
        const data = await response.json();
        showMessage(data.message || 'Doctor added successfully!', 'success');
        
        resetForm();
        fetchDoctors();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Prepare form for editing
async function editDoctor(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor/${id}`);
        if (!response.ok) throw new Error('Failed to fetch doctor details.');
        
        const doctor = await response.json();
        
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('name').value = doctor.name;
        document.getElementById('specialization').value = doctor.specialization;
        document.getElementById('email').value = doctor.email;
        document.getElementById('phone').value = doctor.phone;
        
        formTitle.innerText = 'Update Doctor';
        saveBtn.innerText = 'Update Doctor';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Update existing doctor
async function updateDoctor(id, doctor) {
    // Add id to doctor object as required by typical ASP.NET put methods depending on body binding,
    // though the URL has it. Let's send it in body just in case the model requires it (it usually maps).
    doctor.id = parseInt(id);

    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doctor)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to update doctor.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Doctor updated successfully!', 'success');
        
        resetForm();
        fetchDoctors();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Delete doctor
async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to delete doctor.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Doctor deleted successfully!', 'success');
        
        fetchDoctors();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Reset form
function resetForm() {
    doctorForm.reset();
    document.getElementById('doctorId').value = '';
    formTitle.innerText = 'Add New Doctor';
    saveBtn.innerText = 'Save Doctor';
}

// Show success or error message
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    
    // Hide after 5 seconds
    setTimeout(() => {
        messageBox.className = 'message';
    }, 5000);
}
