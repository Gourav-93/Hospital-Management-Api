using Microsoft.AspNetCore.Mvc;
using HospitalManagementApi.Models;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/role-access")]
    public class RoleAccessController : ControllerBase
    {
        // GET: api/role-access/admin?role=Admin
        [HttpGet("admin")]
        public IActionResult AdminAccess(Role role)
        {
            if (role != Role.Admin)
            {
                return Forbid();
            }

            return Ok(new
            {
                message = "Admin access granted",
                role = role.ToString(),
                access = new[]
                {
                    "Manage Doctors",
                    "Manage Patients",
                    "Manage Appointments",
                    "View Dashboard"
                }
            });
        }

        // GET: api/role-access/doctor?role=Doctor
        [HttpGet("doctor")]
        public IActionResult DoctorAccess(Role role)
        {
            if (role != Role.Doctor)
            {
                return Forbid();
            }

            return Ok(new
            {
                message = "Doctor access granted",
                role = role.ToString(),
                access = new[]
                {
                    "View Doctor Profile",
                    "View Patients",
                    "Manage Appointments"
                }
            });
        }

        // GET: api/role-access/patient?role=Patient
        [HttpGet("patient")]
        public IActionResult PatientAccess(Role role)
        {
            if (role != Role.Patient)
            {
                return Forbid();
            }

            return Ok(new
            {
                message = "Patient access granted",
                role = role.ToString(),
                access = new[]
                {
                    "View Doctors",
                    "View Own Profile",
                    "Book Appointment",
                    "View Own Appointments"
                }
            });
        }
    }
}