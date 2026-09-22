using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/doctor-role")]
    [Authorize(Roles = "Doctor")]
    public class DoctorRoleController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetDoctorAccess()
        {
            return Ok(new
            {
                message = "Welcome Doctor",
                role = "Doctor",
                access = new[]
                {
                    "View Doctor Profile",
                    "View Patients",
                    "Manage Appointments"
                }
            });
        }
    }
}