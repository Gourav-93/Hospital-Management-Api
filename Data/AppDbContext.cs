using Microsoft.EntityFrameworkCore;
using HospitalManagementApi.Models;

namespace HospitalManagementApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Doctor> Doctors { get; set; }

        public DbSet<Patient> Patients { get; set; }

        public DbSet<Appointment> Appointments { get; set; }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Doctor -> Appointment
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Patient -> Appointment
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Doctor
            modelBuilder.Entity<User>()
                .HasOne(u => u.Doctor)
                .WithMany()
                .HasForeignKey(u => u.DoctorId)
                .OnDelete(DeleteBehavior.SetNull);

            // User -> Patient
            modelBuilder.Entity<User>()
                .HasOne(u => u.Patient)
                .WithMany()
                .HasForeignKey(u => u.PatientId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}