// Run auth check
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    fetchAppointments();
    loadSelectOptions();

    document.getElementById('appointmentForm').addEventListener('submit', handleFormSubmit);
    
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        const status = e.target.value;
        if (status) {
            filterAppointmentsByStatus(status);
        } else {
            fetchAppointments();
        }
    });
});

async function fetchAppointments() {
    toggleLoader(true);
    try {
        const role = getRole();
        let endpoint = `${API_BASE_URL}/appointment`;
        
        if (role === 'Doctor') {
            endpoint = `${API_BASE_URL}/appointment/my-appointments`;
        } else if (role === 'Patient') {
            endpoint = `${API_BASE_URL}/appointment/my-patient-appointments`;
        }

        const response = await fetchWithAuth(endpoint);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const appointments = await response.json();
        renderTable(appointments);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        toggleLoader(false);
    }
}

async function filterAppointmentsByStatus(status) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/appointment/status/${encodeURIComponent(status)}`);
        if (!response.ok) throw new Error('Filter failed');
        const appointments = await response.json();
        renderTable(appointments);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function renderTable(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    const table = document.getElementById('appointmentsTable');
    const emptyState = document.getElementById('empty-state');
    
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    emptyState.style.display = 'none';
    
    appointments.forEach(appointment => {
        const doctorName = appointment.doctorName || `Doctor ID: ${appointment.doctorId}`;
        const patientName = appointment.patientName || `Patient ID: ${appointment.patientId}`;
        const apptDate = new Date(appointment.appointmentDate).toLocaleString();
        
        let badgeClass = 'badge-pending';
        if (appointment.status === 'Confirmed') badgeClass = 'badge-confirmed';
        if (appointment.status === 'Completed') badgeClass = 'badge-completed';
        if (appointment.status === 'Cancelled') badgeClass = 'badge-cancelled';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appointment.id}</td>
            <td>${doctorName}</td>
            <td>${patientName}</td>
            <td>${apptDate}</td>
            <td><span class="badge ${badgeClass}">${appointment.status}</span></td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editAppointment(${appointment.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadSelectOptions() {
    try {
        // Load Doctors
        const docRes = await fetchWithAuth(`${API_BASE_URL}/doctor`);
        if (docRes.ok) {
            const doctors = await docRes.json();
            const doctorSelect = document.getElementById('doctorId');
            doctors.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${doc.name} (${doc.specialization})`;
                doctorSelect.appendChild(option);
            });
        }
        
        // Load Patients
        const patRes = await fetchWithAuth(`${API_BASE_URL}/patient`);
        if (patRes.ok) {
            const patients = await patRes.json();
            const patientSelect = document.getElementById('patientId');
            patients.forEach(pat => {
                const option = document.createElement('option');
                option.value = pat.id;
                option.textContent = `${pat.name}`;
                patientSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load select options:', error);
    }
}

function openModal(appointmentId = null) {
    const modal = document.getElementById('appointmentModal');
    const form = document.getElementById('appointmentForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('appointmentId').value = '';
    
    if (appointmentId) {
        title.textContent = 'Edit Appointment';
        fetchAppointmentDetails(appointmentId);
    } else {
        title.textContent = 'Add Appointment';
        
        // Set default date to current time
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('appointmentDate').value = now.toISOString().slice(0, 16);
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('appointmentModal').classList.remove('active');
}

async function fetchAppointmentDetails(id) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/appointment/${id}`);
        if (!response.ok) throw new Error('Failed to fetch appointment details');
        const appointment = await response.json();
        
        document.getElementById('appointmentId').value = appointment.id;
        document.getElementById('doctorId').value = appointment.doctorId;
        document.getElementById('patientId').value = appointment.patientId;
        
        // Format datetime for datetime-local input
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setMinutes(apptDate.getMinutes() - apptDate.getTimezoneOffset());
        document.getElementById('appointmentDate').value = apptDate.toISOString().slice(0, 16);
        
        document.getElementById('status').value = appointment.status;
    } catch (error) {
        showToast(error.message, 'error');
        closeModal();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('appointmentId').value;
    const appointmentData = {
        doctorId: parseInt(document.getElementById('doctorId').value),
        patientId: parseInt(document.getElementById('patientId').value),
        appointmentDate: document.getElementById('appointmentDate').value,
        status: document.getElementById('status').value
    };
    
    try {
        let response;
        if (id) {
            // Update
            appointmentData.id = parseInt(id);
            response = await fetchWithAuth(`${API_BASE_URL}/appointment/${id}`, {
                method: 'PUT',
                body: JSON.stringify(appointmentData)
            });
        } else {
            // Create
            response = await fetchWithAuth(`${API_BASE_URL}/appointment`, {
                method: 'POST',
                body: JSON.stringify(appointmentData)
            });
        }
        
        if (!response.ok) throw new Error('Failed to save appointment');
        
        showToast(id ? 'Appointment updated successfully' : 'Appointment added successfully');
        closeModal();
        fetchAppointments();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/appointment/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete appointment');
        
        showToast('Appointment deleted successfully');
        fetchAppointments();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function toggleLoader(show) {
    const loader = document.getElementById('loader');
    const table = document.getElementById('appointmentsTable');
    if (show) {
        loader.style.display = 'block';
        table.style.display = 'none';
    } else {
        loader.style.display = 'none';
    }
}
