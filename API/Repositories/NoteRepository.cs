using Microsoft.EntityFrameworkCore;
using PersonalNotesManager.Data;
using PersonalNotesManager.Models;
using PersonalNotesManager.Interfaces;

namespace PersonalNotesManager.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly AppDbContext _context;

        public NoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Note>> GetAllAsync()
        {
            return await _context.Notes
                .Include(n => n.NoteTags)
                    .ThenInclude(nt => nt.Tag)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Note?> GetByIdAsync(int id)
        {
            return await _context.Notes
                .Include(n => n.NoteTags)
                    .ThenInclude(nt => nt.Tag)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

     public async Task<List<Note>> SearchAsync(string query)
{
    var pattern = $"%{query.ToLower()}%";

    return await _context.Notes
        .Where(n =>
            EF.Functions.Like(n.Title.ToLower(), pattern) ||
            EF.Functions.Like(n.Content.ToLower(), pattern))
        .Include(n => n.NoteTags)
            .ThenInclude(nt => nt.Tag)
        .ToListAsync();
}


      public async Task<List<Note>> FilterByTagsAsync(IEnumerable<string> tagNames)
{
    var lowerTagNames = tagNames.Select(t => t.ToLower()).ToList();

    return await _context.Notes
        .Where(n => n.NoteTags.Any(nt => lowerTagNames.Contains(nt.Tag.Name.ToLower())))
        .Include(n => n.NoteTags)
            .ThenInclude(nt => nt.Tag)
        .ToListAsync();
}


        public async Task AddAsync(Note note)
        {
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
        }

     public async Task UpdateAsync(Note note)
{
    note.SavedAt = DateTime.UtcNow;

    _context.Notes.Update(note);
    await _context.SaveChangesAsync();
}


        public async Task DeleteAsync(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note != null)
            {
                _context.Notes.Remove(note);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Note>> GetPinnedNotesAsync()
        {
            return await _context.Notes
                .Where(n => n.IsPinned)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }


        public async Task<Note?> GetByIdWithTagsAsync(int id)
        {
            return await _context.Notes
                .Include(n => n.NoteTags)
                    .ThenInclude(nt => nt.Tag)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

    }
}
