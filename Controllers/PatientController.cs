using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementApi.Data;
using HospitalManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllPatients()
        {
            var patients = await _context.Patients.ToListAsync();

            return Ok(patients);
        }

        // GET: api/patient/1
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
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

        // GET: api/patient/search?name=rahul
        [HttpGet("search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchPatient(string name)
        {
            var patients = await _context.Patients
                .Where(p => p.Name.ToLower().Contains(name.ToLower()))
                .ToListAsync();

            if (patients.Count == 0)
            {
                return NotFound(new
                {
                    message = "No patient found"
                });
            }

            return Ok(patients);
        }

        // POST: api/patient
        [HttpPost]
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        // GET: api/patient/my-profile
        [HttpGet("my-profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyProfile()
        {
            var patientIdClaim = User.FindFirst("PatientId")?.Value;

            if (patientIdClaim == null)
            {
                return BadRequest(new
                {
                    message = "PatientId not found in token"
                });
            }

            if (!int.TryParse(patientIdClaim, out int patientId))
            {
                return BadRequest(new
                {
                    message = "Invalid PatientId"
                });
            }

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Id == patientId);

            if (patient == null)
            {
                return NotFound(new
                {
                    message = "Patient not found"
                });
            }

            return Ok(patient);
        }
    }
}