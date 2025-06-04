using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MTbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectFieldToListenedModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProjectId",
                table: "ListenedMarkings",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ListenedMarkings_ProjectId",
                table: "ListenedMarkings",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListenedMarkings_Projects_ProjectId",
                table: "ListenedMarkings",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListenedMarkings_Projects_ProjectId",
                table: "ListenedMarkings");

            migrationBuilder.DropIndex(
                name: "IX_ListenedMarkings_ProjectId",
                table: "ListenedMarkings");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "ListenedMarkings");
        }
    }
}
