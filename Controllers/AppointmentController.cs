using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementApi.Data;
using HospitalManagementApi.Models;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/appointment")]
    public class AppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Select(a => new
                {
                    a.Id,

                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor != null
                        ? a.Doctor.Name
                        : null,

                    PatientId = a.PatientId,
                    PatientName = a.Patient != null
                        ? a.Patient.Name
                        : null,

                    a.AppointmentDate,
                    a.Status
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAppointmentById(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,

                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor != null
                        ? a.Doctor.Name
                        : null,

                    PatientId = a.PatientId,
                    PatientName = a.Patient != null
                        ? a.Patient.Name
                        : null,

                    a.AppointmentDate,
                    a.Status
                })
                .FirstOrDefaultAsync();

            if (appointment == null)
            {
                return NotFound(new
                {
                    message = "Appointment not found"
                });
            }

            return Ok(appointment);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment(
            Appointment appointment)
        {
            var doctor = await _context.Doctors
                .FindAsync(appointment.DoctorId);

            if (doctor == null)
            {
                return BadRequest(new
                {
                    message = "Doctor not found"
                });
            }

            var patient = await _context.Patients
                .FindAsync(appointment.PatientId);

            if (patient == null)
            {
                return BadRequest(new
                {
                    message = "Patient not found"
                });
            }

            _context.Appointments.Add(appointment);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Appointment created successfully",

                appointment = new
                {
                    appointment.Id,

                    DoctorId = doctor.Id,
                    DoctorName = doctor.Name,

                    PatientId = patient.Id,
                    PatientName = patient.Name,

                    appointment.AppointmentDate,
                    appointment.Status
                }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id,Appointment appointment)
        {
            var existingAppointment = await _context.Appointments.FindAsync(id);

            if (existingAppointment == null)
            {
                return NotFound(new
                {
                    message = "Appointment not found"
                });
            }

            var doctor = await _context.Doctors
                .FindAsync(appointment.DoctorId);

            if (doctor == null)
            {
                return BadRequest(new
                {
                    message = "Doctor not found"
                });
            }

            var patient = await _context.Patients
                .FindAsync(appointment.PatientId);

            if (patient == null)
            {
                return BadRequest(new
                {
                    message = "Patient not found"
                });
            }

            existingAppointment.DoctorId = appointment.DoctorId;
            existingAppointment.PatientId = appointment.PatientId;
            existingAppointment.AppointmentDate = appointment.AppointmentDate;
            existingAppointment.Status = appointment.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Appointment updated successfully",

                appointment = new
                {
                    existingAppointment.Id,

                    DoctorId = doctor.Id,
                    DoctorName = doctor.Name,

                    PatientId = patient.Id,
                    PatientName = patient.Name,

                    existingAppointment.AppointmentDate,
                    existingAppointment.Status
                }
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment =
                await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound(new
                {
                    message = "Appointment not found"
                });
            }

            _context.Appointments.Remove(appointment);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Appointment deleted successfully"
            });
        }
    }
}