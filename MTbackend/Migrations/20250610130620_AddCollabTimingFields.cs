using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MTbackend.Migrations
{
    /// <inheritdoc />
    public partial class AddCollabTimingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompletionReason",
                table: "Collabs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReleaseTime",
                table: "Collabs",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WinningSubmissionId",
                table: "Collabs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Collabs_WinningSubmissionId",
                table: "Collabs",
                column: "WinningSubmissionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Collabs_Submissions_WinningSubmissionId",
                table: "Collabs",
                column: "WinningSubmissionId",
                principalTable: "Submissions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Collabs_Submissions_WinningSubmissionId",
                table: "Collabs");

            migrationBuilder.DropIndex(
                name: "IX_Collabs_WinningSubmissionId",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "CompletionReason",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "ReleaseTime",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "WinningSubmissionId",
                table: "Collabs");
        }
    }
}
