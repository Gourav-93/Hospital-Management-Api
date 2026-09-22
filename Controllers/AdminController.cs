using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        // GET: api/admin
        [HttpGet]
        public IActionResult GetAdminDashboard()
        {
            return Ok(new
            {
                message = "Welcome Admin",
                role = "Admin",
                access = new[]
                {
                    "Manage Doctors",
                    "Manage Patients",
                    "Manage Appointments",
                    "View Dashboard"
                }
            });
        }
    }
}