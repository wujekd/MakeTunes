using Microsoft.EntityFrameworkCore;
using MTbackend.Models;

namespace MTbackend
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
    }
}