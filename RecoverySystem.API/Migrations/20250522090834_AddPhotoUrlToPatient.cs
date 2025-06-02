using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RecoverySystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoUrlToPatient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "Patients",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "Patients");
        }
    }
}
