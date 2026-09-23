import { api } from './api.js';

const tableBody = document.getElementById('doctors-table-body');
const modalOverlay = document.getElementById('doctor-modal');
const doctorForm = document.getElementById('doctor-form');
const modalTitle = document.getElementById('modal-title');

// Form inputs
const idInput = document.getElementById('doctor-id');
const nameInput = document.getElementById('doctor-name');
const specInput = document.getElementById('doctor-spec');
const emailInput = document.getElementById('doctor-email');
const phoneInput = document.getElementById('doctor-phone');

// Load and render doctors
async function loadDoctors() {
    try {
        const doctors = await api.getDoctors();
        renderDoctors(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center empty-state" style="color: #dc3545;">Failed to load data. Ensure backend is running.</td></tr>`;
    }
}

function renderDoctors(doctors) {
    if (doctors.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center empty-state">No doctors found. Add one to get started.</td></tr>`;
        return;
    }

    tableBody.innerHTML = doctors.map(doctor => `
        <tr>
            <td style="font-weight: bold">${doctor.name}</td>
            <td><span class="badge" style="background: #e9ecef; color: #333;">${doctor.specialization}</span></td>
            <td>${doctor.email}</td>
            <td>${doctor.phone}</td>
            <td style="text-align: right; display: flex; gap: 5px; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="window.editDoctor(${doctor.id})">Edit</button>
                <button class="btn btn-danger" onclick="window.deleteDoctor(${doctor.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Modal handling
function openModal(isEdit = false) {
    modalTitle.textContent = isEdit ? 'Edit Doctor' : 'Add New Doctor';
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    doctorForm.reset();
    idInput.value = '';
}

document.getElementById('open-add-modal').addEventListener('click', () => openModal(false));
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-btn').addEventListener('click', closeModal);

// Form submission
doctorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const doctorData = {
        name: nameInput.value,
        specialization: specInput.value,
        email: emailInput.value,
        phone: phoneInput.value
    };
    
    try {
        if (idInput.value) {
            // Update
            doctorData.id = parseInt(idInput.value);
            await api.updateDoctor(doctorData.id, doctorData);
        } else {
            // Create
            await api.createDoctor(doctorData);
        }
        
        closeModal();
        await loadDoctors();
    } catch (error) {
        alert('An error occurred. Check console for details.');
        console.error(error);
    }
});

// Global functions for inline event handlers
window.editDoctor = async (id) => {
    try {
        const doctor = await api.getDoctorById(id);
        idInput.value = doctor.id;
        nameInput.value = doctor.name;
        specInput.value = doctor.specialization;
        emailInput.value = doctor.email;
        phoneInput.value = doctor.phone;
        openModal(true);
    } catch (error) {
        console.error('Failed to fetch doctor details:', error);
    }
};

window.deleteDoctor = async (id) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
        try {
            await api.deleteDoctor(id);
            await loadDoctors();
        } catch (error) {
            console.error('Failed to delete doctor:', error);
            alert('Failed to delete. They might have active appointments.');
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', loadDoctors);
