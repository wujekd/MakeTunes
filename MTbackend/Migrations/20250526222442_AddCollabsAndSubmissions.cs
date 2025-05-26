using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MTbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCollabsAndSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Collab_Projects_ProjectId1",
                table: "Collab");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Collab",
                table: "Collab");

            migrationBuilder.DropIndex(
                name: "IX_Collab_ProjectId1",
                table: "Collab");

            migrationBuilder.DropColumn(
                name: "ProjectId1",
                table: "Collab");

            migrationBuilder.DropColumn(
                name: "Stage",
                table: "Collab");

            migrationBuilder.RenameTable(
                name: "Collab",
                newName: "Collabs");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "Projects",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "char(36)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("Relational:Collation", "ascii_general_ci");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Projects",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsInVotingStage",
                table: "Projects",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "ProjectId",
                table: "Collabs",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Collabs",
                table: "Collabs",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Submissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    AudioFilePath = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Submissions", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Collabs_ProjectId",
                table: "Collabs",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Collabs_Projects_ProjectId",
                table: "Collabs",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Collabs_Projects_ProjectId",
                table: "Collabs");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Collabs",
                table: "Collabs");

            migrationBuilder.DropIndex(
                name: "IX_Collabs_ProjectId",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsInVotingStage",
                table: "Projects");

            migrationBuilder.RenameTable(
                name: "Collabs",
                newName: "Collab");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Projects",
                type: "char(36)",
                nullable: false,
                collation: "ascii_general_ci",
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "Collab",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId1",
                table: "Collab",
                type: "char(36)",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                collation: "ascii_general_ci");

            migrationBuilder.AddColumn<int>(
                name: "Stage",
                table: "Collab",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Collab",
                table: "Collab",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Collab_ProjectId1",
                table: "Collab",
                column: "ProjectId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Collab_Projects_ProjectId1",
                table: "Collab",
                column: "ProjectId1",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
