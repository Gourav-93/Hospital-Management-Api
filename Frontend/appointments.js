import { api } from './api.js';

const tableBody = document.getElementById('appointments-table-body');
const modalOverlay = document.getElementById('appointment-modal');
const appointmentForm = document.getElementById('appointment-form');
const modalTitle = document.getElementById('modal-title');

// Form inputs
const idInput = document.getElementById('appointment-id');
const doctorSelect = document.getElementById('appointment-doctor');
const patientSelect = document.getElementById('appointment-patient');
const dateInput = document.getElementById('appointment-date');
const statusSelect = document.getElementById('appointment-status');

// State for lookups
let doctorsList = [];
let patientsList = [];

// Initialize
async function init() {
    try {
        const [doctors, patients, appointments] = await Promise.all([
            api.getDoctors(),
            api.getPatients(),
            api.getAppointments()
        ]);
        
        doctorsList = doctors;
        patientsList = patients;
        
        populateDropdowns();
        renderAppointments(appointments);
    } catch (error) {
        console.error('Error initializing:', error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center empty-state" style="color: #dc3545;">Failed to load data. Ensure backend is running.</td></tr>`;
    }
}

function populateDropdowns() {
    doctorSelect.innerHTML = '<option value="">Select Doctor...</option>' + 
        doctorsList.map(d => `<option value="${d.id}">${d.name} (${d.specialization})</option>`).join('');
        
    patientSelect.innerHTML = '<option value="">Select Patient...</option>' + 
        patientsList.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

async function loadAppointments() {
    try {
        const appointments = await api.getAppointments();
        renderAppointments(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

function getStatusBadgeClass(status) {
    status = (status || 'Pending').toLowerCase();
    if (status === 'completed' || status === 'confirmed') return 'completed';
    if (status === 'cancelled') return 'cancelled';
    return 'pending';
}

function renderAppointments(appointments) {
    if (appointments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center empty-state">No appointments found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = appointments.map(apt => {
        // Map doctor and patient names from lists if backend didn't include them via Includes
        const doctor = apt.doctor ? apt.doctor.name : (doctorsList.find(d => d.id === apt.doctorId)?.name || 'Unknown');
        const patient = apt.patient ? apt.patient.name : (patientsList.find(p => p.id === apt.patientId)?.name || 'Unknown');
        const aptDate = new Date(apt.appointmentDate).toLocaleString();
        
        return `
        <tr>
            <td style="font-weight: bold">${aptDate}</td>
            <td>${doctor}</td>
            <td>${patient}</td>
            <td><span class="badge ${getStatusBadgeClass(apt.status)}">${apt.status}</span></td>
            <td style="text-align: right; display: flex; gap: 5px; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="window.editAppointment(${apt.id})">Edit</button>
                <button class="btn btn-danger" onclick="window.deleteAppointment(${apt.id})">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Modal handling
function openModal(isEdit = false) {
    modalTitle.textContent = isEdit ? 'Edit Appointment' : 'Book Appointment';
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    appointmentForm.reset();
    idInput.value = '';
}

document.getElementById('open-add-modal').addEventListener('click', () => openModal(false));
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-btn').addEventListener('click', closeModal);

// Form submission
appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const appointmentData = {
        doctorId: parseInt(doctorSelect.value),
        patientId: parseInt(patientSelect.value),
        appointmentDate: new Date(dateInput.value).toISOString(),
        status: statusSelect.value
    };
    
    try {
        if (idInput.value) {
            appointmentData.id = parseInt(idInput.value);
            await api.updateAppointment(appointmentData.id, appointmentData);
        } else {
            await api.createAppointment(appointmentData);
        }
        
        closeModal();
        await loadAppointments();
    } catch (error) {
        alert('An error occurred. Check console for details.');
        console.error(error);
    }
});

// Global functions for inline event handlers
window.editAppointment = async (id) => {
    try {
        const appointments = await api.getAppointments();
        const apt = appointments.find(a => a.id === id);
        
        if (apt) {
            idInput.value = apt.id;
            doctorSelect.value = apt.doctorId;
            patientSelect.value = apt.patientId;
            // Format date for datetime-local input (YYYY-MM-DDThh:mm)
            const date = new Date(apt.appointmentDate);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset*60*1000));
            dateInput.value = localDate.toISOString().slice(0, 16);
            
            statusSelect.value = apt.status;
            openModal(true);
        }
    } catch (error) {
        console.error('Failed to fetch appointment details:', error);
    }
};

window.deleteAppointment = async (id) => {
    if (confirm('Are you sure you want to cancel and delete this appointment?')) {
        try {
            await api.deleteAppointment(id);
            await loadAppointments();
        } catch (error) {
            console.error('Failed to delete appointment:', error);
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', init);
