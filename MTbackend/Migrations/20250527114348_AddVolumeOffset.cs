using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MTbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddVolumeOffset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "VolumeOffset",
                table: "Submissions",
                type: "float",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VolumeOffset",
                table: "Submissions");
        }
    }
}
