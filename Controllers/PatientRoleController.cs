using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/patient-role")]
    [Authorize(Roles = "Patient")]
    public class PatientRoleController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetPatientAccess()
        {
            return Ok(new
            {
                message = "Welcome Patient",
                role = "Patient",
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