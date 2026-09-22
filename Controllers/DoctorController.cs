using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementApi.Data;
using HospitalManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/doctor")]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/doctor
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _context.Doctors.ToListAsync();

            return Ok(doctors);
        }

        // GET: api/doctor/1
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDoctorById(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound(new
                {
                    message = "Doctor not found"
                });
            }

            return Ok(doctor);
        }

        // GET: api/doctor/search?name=sharma
        [HttpGet("search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchDoctor(string name)
        {
            var doctors = await _context.Doctors
                .Where(d => d.Name.ToLower().Contains(name.ToLower()))
                .ToListAsync();

            if (doctors.Count == 0)
            {
                return NotFound(new
                {
                    message = "No doctor found"
                });
            }

            return Ok(doctors);
        }

        // POST: api/doctor
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDoctor(Doctor doctor)
        {
            _context.Doctors.Add(doctor);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Doctor created successfully",
                doctor = doctor
            });
        }

        // PUT: api/doctor/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDoctor(
            int id,
            Doctor doctor)
        {
            var existingDoctor =
                await _context.Doctors.FindAsync(id);

            if (existingDoctor == null)
            {
                return NotFound(new
                {
                    message = "Doctor not found"
                });
            }

            existingDoctor.Name = doctor.Name;
            existingDoctor.Specialization = doctor.Specialization;
            existingDoctor.Email = doctor.Email;
            existingDoctor.Phone = doctor.Phone;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Doctor updated successfully",
                doctor = existingDoctor
            });
        }

        // DELETE: api/doctor/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound(new
                {
                    message = "Doctor not found"
                });
            }

            _context.Doctors.Remove(doctor);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Doctor deleted successfully"
            });
        }
        // GET: api/doctor/my-profile
        [HttpGet("my-profile")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMyProfile()
        {
            var doctorIdClaim = User.FindFirst("DoctorId")?.Value;

            if (doctorIdClaim == null)
            {
                return BadRequest(new
                {
                    message = "DoctorId not found in token"
                });
            }

            if (!int.TryParse(doctorIdClaim, out int doctorId))
            {
                return BadRequest(new
                {
                    message = "Invalid DoctorId"
                });
            }

            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.Id == doctorId);

            if (doctor == null)
            {
                return NotFound(new
                {
                    message = "Doctor not found"
                });
            }

            return Ok(doctor);
        }
    }
}