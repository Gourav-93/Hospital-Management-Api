const API_BASE_URL = 'http://localhost:5024';

// Elements
const appointmentForm = document.getElementById('appointmentForm');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');
const messageBox = document.getElementById('messageBox');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const doctorSelect = document.getElementById('doctorId');
const patientSelect = document.getElementById('patientId');
const statusFilter = document.getElementById('statusFilter');

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    loadPatients();
    fetchAppointments();
});

// Handle form submission
appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('appointmentId').value;
    const appointment = {
        doctorId: parseInt(doctorSelect.value),
        patientId: parseInt(patientSelect.value),
        appointmentDate: document.getElementById('appointmentDate').value,
        status: document.getElementById('status').value
    };

    if (id) {
        await updateAppointment(id, appointment);
    } else {
        await addAppointment(appointment);
    }
});

// Load doctors for dropdown
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/doctor`);
        if (!response.ok) throw new Error('Failed to load doctors.');
        const doctors = await response.json();
        
        doctorSelect.innerHTML = '<option value="" disabled selected>Select a Doctor</option>';
        doctors.forEach(doc => {
            doctorSelect.innerHTML += `<option value="${doc.id}">${doc.name} (${doc.specialization})</option>`;
        });
    } catch (error) {
        doctorSelect.innerHTML = '<option value="" disabled>Error loading doctors</option>';
        showMessage('Error loading doctors.', 'error');
    }
}

// Load patients for dropdown
async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/patient`);
        if (!response.ok) throw new Error('Failed to load patients.');
        const patients = await response.json();
        
        patientSelect.innerHTML = '<option value="" disabled selected>Select a Patient</option>';
        patients.forEach(pat => {
            patientSelect.innerHTML += `<option value="${pat.id}">${pat.name} (ID: ${pat.id})</option>`;
        });
    } catch (error) {
        patientSelect.innerHTML = '<option value="" disabled>Error loading patients</option>';
        showMessage('Error loading patients.', 'error');
    }
}

// Fetch all appointments
async function fetchAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/appointment`);
        if (!response.ok) throw new Error('Failed to fetch appointments.');
        
        const appointments = await response.json();
        renderTable(appointments);
        statusFilter.value = 'All';
    } catch (error) {
        showMessage(error.message, 'error');
        appointmentsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading appointments.</td></tr>`;
    }
}

// Filter appointments
async function filterAppointments() {
    const status = statusFilter.value;
    if (status === 'All') {
        fetchAppointments();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/appointment/status/${status}`);
        
        if (response.status === 404) {
            renderTable([]);
            return;
        }
        
        if (!response.ok) throw new Error('Filter failed.');
        
        const appointments = await response.json();
        renderTable(appointments);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Render table
function renderTable(appointments) {
    appointmentsTableBody.innerHTML = '';

    if (appointments.length === 0) {
        appointmentsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No appointments found.</td></tr>`;
        return;
    }

    appointments.forEach(apt => {
        // Format Date
        const dateObj = new Date(apt.appointmentDate);
        const formattedDate = dateObj.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        // Status Badge logic can be added here if needed
        const statusBadge = `<span style="padding: 3px 8px; border-radius: 12px; font-size: 0.8em; background: ${getStatusColor(apt.status)}; color: white;">${apt.status}</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${apt.id}</td>
            <td>${apt.doctorName || 'ID: ' + apt.doctorId}</td>
            <td>${apt.patientName || 'ID: ' + apt.patientId}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td class="actions-cell">
                <button class="btn btn-primary btn-sm" onclick="editAppointment(${apt.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${apt.id})">Delete</button>
            </td>
        `;
        appointmentsTableBody.appendChild(tr);
    });
}

// Helper to get color for status
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'confirmed': return '#10b981'; // Green
        case 'completed': return '#3b82f6'; // Blue
        case 'cancelled': return '#ef4444'; // Red
        default: return '#f59e0b'; // Yellow (Pending)
    }
}

// Add appointment
async function addAppointment(appointment) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/appointment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });

        if (!response.ok) {
            const err = await response.json().catch(()=>({}));
            throw new Error(err.message || 'Failed to create appointment.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Appointment created successfully!', 'success');
        
        resetForm();
        
        // If filtered, respect filter or reload all?
        if (statusFilter.value === 'All') fetchAppointments();
        else filterAppointments();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Prepare edit
async function editAppointment(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/appointment/${id}`);
        if (!response.ok) throw new Error('Failed to fetch appointment details.');
        
        const apt = await response.json();
        
        document.getElementById('appointmentId').value = apt.id;
        document.getElementById('doctorId').value = apt.doctorId;
        document.getElementById('patientId').value = apt.patientId;
        
        // Format datetime for datetime-local input
        const dateStr = apt.appointmentDate;
        // Needs YYYY-MM-DDThh:mm format. 
        // Note: The API returns standard ISO string, we can substring first 16 chars usually (YYYY-MM-DDTHH:mm)
        document.getElementById('appointmentDate').value = dateStr.substring(0, 16);
        
        document.getElementById('status').value = apt.status;
        
        formTitle.innerText = 'Update Appointment';
        saveBtn.innerText = 'Update Appointment';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Update appointment
async function updateAppointment(id, appointment) {
    appointment.id = parseInt(id);

    try {
        const response = await fetch(`${API_BASE_URL}/api/appointment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });

        if (!response.ok) {
            const err = await response.json().catch(()=>({}));
            throw new Error(err.message || 'Failed to update appointment.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Appointment updated successfully!', 'success');
        
        resetForm();
        if (statusFilter.value === 'All') fetchAppointments();
        else filterAppointments();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Delete appointment
async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/appointment/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json().catch(()=>({}));
            throw new Error(err.message || 'Failed to delete appointment.');
        }
        
        const data = await response.json();
        showMessage(data.message || 'Appointment deleted successfully!', 'success');
        
        if (statusFilter.value === 'All') fetchAppointments();
        else filterAppointments();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Reset form
function resetForm() {
    appointmentForm.reset();
    document.getElementById('appointmentId').value = '';
    formTitle.innerText = 'Create Appointment';
    saveBtn.innerText = 'Save Appointment';
}

// Show message
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    
    setTimeout(() => {
        messageBox.className = 'message';
    }, 5000);
}
