using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUserDoctorPatientRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DoctorId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatientId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_DoctorId",
                table: "Users",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PatientId",
                table: "Users",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Doctors_DoctorId",
                table: "Users",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Patients_PatientId",
                table: "Users",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Doctors_DoctorId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Patients_PatientId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_DoctorId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_PatientId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DoctorId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "Users");
        }
    }
}
