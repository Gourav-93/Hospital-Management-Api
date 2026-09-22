using System.ComponentModel.DataAnnotations;

namespace HospitalManagementApi.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public Role Role { get; set; }

        public int? DoctorId { get; set; }

        public int? PatientId { get; set; }

        public Doctor? Doctor { get; set; }

        public Patient? Patient { get; set; }
    }
}