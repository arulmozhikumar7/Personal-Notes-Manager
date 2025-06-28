using Microsoft.EntityFrameworkCore;
using PersonalNotesManager.Models;

namespace PersonalNotesManager.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Note> Notes { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<NoteTag> NoteTags { get; set; }
        public DbSet<Draft> Drafts { get; set; }

        public DbSet<DraftTag> DraftTags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure composite key for join table
            modelBuilder.Entity<NoteTag>()
                .HasKey(nt => new { nt.NoteId, nt.TagId });

            // Configure many-to-many relationship
            modelBuilder.Entity<NoteTag>()
                .HasOne(nt => nt.Note)
                .WithMany(n => n.NoteTags)
                .HasForeignKey(nt => nt.NoteId);

            modelBuilder.Entity<NoteTag>()
                .HasOne(nt => nt.Tag)
                .WithMany(t => t.NoteTags)
                .HasForeignKey(nt => nt.TagId);

            // Optional: make tag name unique
            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.Name)
                .IsUnique();

            modelBuilder.Entity<DraftTag>()
                .HasOne(dt => dt.Draft)
                .WithMany(d => d.DraftTags)
                .HasForeignKey(dt => dt.DraftId);

            modelBuilder.Entity<DraftTag>()
                .HasOne(dt => dt.Tag)
                .WithMany()
                .HasForeignKey(dt => dt.TagId);

        }
    }
}
