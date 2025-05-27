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
        public DbSet<Collab> Collabs { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Project>()
                .HasMany(p => p.Collabs)
                .WithOne(c => c.Project)
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Collab>()
                .HasMany(c => c.Submissions)
                .WithOne(s => s.Collab)
                .HasForeignKey(s => s.CollabId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}