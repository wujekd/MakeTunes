using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MTbackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCollabModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Completed",
                table: "Collabs",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Released",
                table: "Collabs",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "SubmissionDuration",
                table: "Collabs",
                type: "time(6)",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "VotingDuration",
                table: "Collabs",
                type: "time(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Completed",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "Released",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "SubmissionDuration",
                table: "Collabs");

            migrationBuilder.DropColumn(
                name: "VotingDuration",
                table: "Collabs");
        }
    }
}
