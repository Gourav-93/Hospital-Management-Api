using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalManagementApi.Data;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var totalDoctors = await _context.Doctors.CountAsync();

            var totalPatients = await _context.Patients.CountAsync();

            var totalAppointments = await _context.Appointments.CountAsync();

            var pendingAppointments = await _context.Appointments.CountAsync(a => a.Status == "Pending");

            var confirmedAppointments = await _context.Appointments.CountAsync(a => a.Status == "Confirmed");

            var completedAppointments = await _context.Appointments.CountAsync(a => a.Status == "Completed");

            return Ok(new
            {
                totalDoctors,
                totalPatients,
                totalAppointments,
                pendingAppointments,
                confirmedAppointments,
                completedAppointments
            });
        }
    }
}