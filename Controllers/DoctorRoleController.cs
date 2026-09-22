using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/doctor-role")]
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