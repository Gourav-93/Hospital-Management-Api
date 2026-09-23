const BASE_URL = 'http://localhost:5024/api';

export const api = {
    // Doctors
    getDoctors: async () => {
        const response = await fetch(`${BASE_URL}/doctor`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        return response.json();
    },
    getDoctorById: async (id) => {
        const response = await fetch(`${BASE_URL}/doctor/${id}`);
        if (!response.ok) throw new Error('Failed to fetch doctor');
        return response.json();
    },
    createDoctor: async (doctor) => {
        const response = await fetch(`${BASE_URL}/doctor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });
        if (!response.ok) throw new Error('Failed to create doctor');
        return response.json();
    },
    updateDoctor: async (id, doctor) => {
        const response = await fetch(`${BASE_URL}/doctor/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });
        if (!response.ok) throw new Error('Failed to update doctor');
        return response.json();
    },
    deleteDoctor: async (id) => {
        const response = await fetch(`${BASE_URL}/doctor/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete doctor');
        return response.json();
    },

    // Patients
    getPatients: async () => {
        const response = await fetch(`${BASE_URL}/patient`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        return response.json();
    },
    createPatient: async (patient) => {
        const response = await fetch(`${BASE_URL}/patient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient)
        });
        if (!response.ok) throw new Error('Failed to create patient');
        return response.json();
    },
    updatePatient: async (id, patient) => {
        const response = await fetch(`${BASE_URL}/patient/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient)
        });
        if (!response.ok) throw new Error('Failed to update patient');
        return response.json();
    },
    deletePatient: async (id) => {
        const response = await fetch(`${BASE_URL}/patient/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete patient');
        return response.json();
    },

    // Appointments
    getAppointments: async () => {
        const response = await fetch(`${BASE_URL}/appointment`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        return response.json();
    },
    createAppointment: async (appointment) => {
        const response = await fetch(`${BASE_URL}/appointment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });
        if (!response.ok) throw new Error('Failed to create appointment');
        return response.json();
    },
    updateAppointment: async (id, appointment) => {
        const response = await fetch(`${BASE_URL}/appointment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });
        if (!response.ok) throw new Error('Failed to update appointment');
        return response.json();
    },
    deleteAppointment: async (id) => {
        const response = await fetch(`${BASE_URL}/appointment/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete appointment');
        return response.json();
    }
};
