using Microsoft.EntityFrameworkCore;
using PersonalNotesManager.Data;
using PersonalNotesManager.Models;
using PersonalNotesManager.Interfaces;

namespace PersonalNotesManager.Repositories
{
    public class DraftRepository : IDraftRepository
    {
        private readonly AppDbContext _context;

        public DraftRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Draft>> GetAllAsync()
        {
            return await _context.Drafts
                .Include(d => d.DraftTags)
                    .ThenInclude(dt => dt.Tag)
                .OrderByDescending(d => d.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Draft?> GetByIdAsync(int id)
        {
            return await _context.Drafts
                .Include(d => d.DraftTags)
                    .ThenInclude(dt => dt.Tag)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Draft?> GetLatestAsync()
        {
            return await _context.Drafts
                .Include(d => d.DraftTags)
                    .ThenInclude(dt => dt.Tag)
                .OrderByDescending(d => d.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Draft draft)
        {
            _context.Drafts.Add(draft);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Draft draft)
        {
            _context.Drafts.Update(draft);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft != null)
            {
                _context.Drafts.Remove(draft);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAllAsync()
        {
            var allDrafts = await _context.Drafts.ToListAsync();
            _context.Drafts.RemoveRange(allDrafts);
            await _context.SaveChangesAsync();
        }
    }
}
