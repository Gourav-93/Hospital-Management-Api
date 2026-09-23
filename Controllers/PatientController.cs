using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementApi.Data;
using HospitalManagementApi.Models;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/patient")]
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PatientController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/patient
        [HttpGet]
        public async Task<IActionResult> GetAllPatients()
        {
            var patients = await _context.Patients.ToListAsync();

            return Ok(patients);
        }

        // GET: api/patient/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found"
                });
            }

            return Ok(patient);
        }

        // POST: api/patient
        [HttpPost]
        public async Task<IActionResult> CreatePatient(Patient patient)
        {
            _context.Patients.Add(patient);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Patient created successfully",
                patient = patient
            });
        }

        // PUT: api/patient/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(
            int id,
            Patient patient)
        {
            var existingPatient =
                await _context.Patients.FindAsync(id);

            if (existingPatient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found"
                });
            }

            existingPatient.Name = patient.Name;
            existingPatient.Age = patient.Age;
            existingPatient.Gender = patient.Gender;
            existingPatient.Disease = patient.Disease;
            existingPatient.Phone = patient.Phone;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Patient updated successfully",
                patient = existingPatient
            });
        }

        // DELETE: api/patient/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found"
                });
            }

            _context.Patients.Remove(patient);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Patient deleted successfully"
            });
        }
    }
}