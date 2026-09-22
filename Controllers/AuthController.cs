using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HospitalManagementApi.Data;
using HospitalManagementApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HospitalManagementApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // Check email
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == user.Email);

            if (existingUser != null)
            {
                return BadRequest(new
                {
                    message = "Email already registered"
                });
            }


            // =========================
            // ADMIN
            // =========================

            if (user.Role == Role.Admin)
            {
                user.DoctorId = null;
                user.PatientId = null;
            }


            // =========================
            // DOCTOR
            // =========================

            if (user.Role == Role.Doctor)
            {
                var newDoctor = new Doctor
                {
                    Name = user.Name,
                    Email = user.Email
                };
                _context.Doctors.Add(newDoctor);
                await _context.SaveChangesAsync();

                user.DoctorId = newDoctor.Id;
            }


            // =========================
            // PATIENT
            // =========================

            if (user.Role == Role.Patient)
            {
                var newPatient = new Patient
                {
                    Name = user.Name
                };
                _context.Patients.Add(newPatient);
                await _context.SaveChangesAsync();

                user.PatientId = newPatient.Id;
            }


            // =========================
            // HASH PASSWORD
            // =========================

            user.Password =
                BCrypt.Net.BCrypt.HashPassword(user.Password);


            // =========================
            // SAVE USER
            // =========================

            _context.Users.Add(user);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message = "Registration successful",

                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role,
                    user.DoctorId,
                    user.PatientId
                }
            });
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(User loginUser)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginUser.Email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password"
                });
            }

            bool passwordValid =
                BCrypt.Net.BCrypt.Verify(
                    loginUser.Password,
                    user.Password
                );

            if (!passwordValid)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password"
                });
            }

            var claims = new List<Claim>
{
    new Claim(
        ClaimTypes.NameIdentifier,
        user.Id.ToString()
    ),

    new Claim(
        ClaimTypes.Name,
        user.Name
    ),

    new Claim(
        ClaimTypes.Email,
        user.Email
    ),

    new Claim(
        ClaimTypes.Role,
        user.Role.ToString()
    )
};


            // Doctor user ke liye DoctorId
            if (user.DoctorId.HasValue)
            {
                claims.Add(
                    new Claim(
                        "DoctorId",
                        user.DoctorId.Value.ToString()
                    )
                );
            }


            // Patient user ke liye PatientId
            if (user.PatientId.HasValue)
            {
                claims.Add(
                    new Claim(
                        "PatientId",
                        user.PatientId.Value.ToString()
                    )
                );
            }


            // =========================
            // JWT KEY
            // =========================

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );


            // =========================
            // CREATE TOKEN
            // =========================

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],

                audience: _configuration["Jwt:Audience"],

                claims: claims,

                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(
                        _configuration["Jwt:ExpiryMinutes"]!
                    )
                ),

                signingCredentials: credentials
            );


            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);


            return Ok(new
            {
                message = "Login successful",

                token = tokenString,

                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role
                }
            });
        }
    }
}