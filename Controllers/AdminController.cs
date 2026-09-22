using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
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