using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MTbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CollabId",
                table: "Submissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Submissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_CollabId",
                table: "Submissions",
                column: "CollabId");

            migrationBuilder.AddForeignKey(
                name: "FK_Submissions_Collabs_CollabId",
                table: "Submissions",
                column: "CollabId",
                principalTable: "Collabs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Submissions_Collabs_CollabId",
                table: "Submissions");

            migrationBuilder.DropIndex(
                name: "IX_Submissions_CollabId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "CollabId",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Submissions");
        }
    }
}
