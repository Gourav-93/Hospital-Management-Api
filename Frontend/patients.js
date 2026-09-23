import { api } from './api.js';

const tableBody = document.getElementById('patients-table-body');
const modalOverlay = document.getElementById('patient-modal');
const patientForm = document.getElementById('patient-form');
const modalTitle = document.getElementById('modal-title');

// Form inputs
const idInput = document.getElementById('patient-id');
const nameInput = document.getElementById('patient-name');
const ageInput = document.getElementById('patient-age');
const genderInput = document.getElementById('patient-gender');
const diseaseInput = document.getElementById('patient-disease');
const phoneInput = document.getElementById('patient-phone');

// Load and render patients
async function loadPatients() {
    try {
        const patients = await api.getPatients();
        renderPatients(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center empty-state" style="color: #dc3545;">Failed to load data. Ensure backend is running.</td></tr>`;
    }
}

function renderPatients(patients) {
    if (patients.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center empty-state">No patients found. Add one to get started.</td></tr>`;
        return;
    }

    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td style="font-weight: bold">${patient.name}</td>
            <td>${patient.age} / ${patient.gender}</td>
            <td><span class="badge" style="background: #e9ecef; color: #333;">${patient.disease}</span></td>
            <td>${patient.phone}</td>
            <td style="text-align: right; display: flex; gap: 5px; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="window.editPatient(${patient.id})">Edit</button>
                <button class="btn btn-danger" onclick="window.deletePatient(${patient.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Modal handling
function openModal(isEdit = false) {
    modalTitle.textContent = isEdit ? 'Edit Patient' : 'Add New Patient';
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    patientForm.reset();
    idInput.value = '';
}

document.getElementById('open-add-modal').addEventListener('click', () => openModal(false));
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-btn').addEventListener('click', closeModal);

// Form submission
patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const patientData = {
        name: nameInput.value,
        age: parseInt(ageInput.value),
        gender: genderInput.value,
        disease: diseaseInput.value,
        phone: phoneInput.value
    };
    
    try {
        if (idInput.value) {
            // Update
            patientData.id = parseInt(idInput.value);
            await api.updatePatient(patientData.id, patientData);
        } else {
            // Create
            await api.createPatient(patientData);
        }
        
        closeModal();
        await loadPatients();
    } catch (error) {
        alert('An error occurred. Check console for details.');
        console.error(error);
    }
});

// Global functions for inline event handlers
window.editPatient = async (id) => {
    try {
        // Find patient in current list to populate fast (or fetch by id if backend has it)
        const patients = await api.getPatients();
        const patient = patients.find(p => p.id === id);
        
        if (patient) {
            idInput.value = patient.id;
            nameInput.value = patient.name;
            ageInput.value = patient.age;
            genderInput.value = patient.gender;
            diseaseInput.value = patient.disease;
            phoneInput.value = patient.phone;
            openModal(true);
        }
    } catch (error) {
        console.error('Failed to fetch patient details:', error);
    }
};

window.deletePatient = async (id) => {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            await api.deletePatient(id);
            await loadPatients();
        } catch (error) {
            console.error('Failed to delete patient:', error);
            alert('Failed to delete. They might have active appointments.');
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', loadPatients);
