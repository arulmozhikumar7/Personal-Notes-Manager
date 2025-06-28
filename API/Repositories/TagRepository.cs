using Microsoft.EntityFrameworkCore;
using PersonalNotesManager.Data;
using PersonalNotesManager.Models;
using PersonalNotesManager.Interfaces;
namespace PersonalNotesManager.Repositories
{
    public class TagRepository : ITagRepository
    {
        private readonly AppDbContext _context;

        public TagRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Tag>> GetAllAsync()
        {
            return await _context.Tags.ToListAsync();
        }

        public async Task<Tag?> GetByIdAsync(int id)
        {
            return await _context.Tags.FindAsync(id);
        }

        public async Task<Tag?> GetByNameAsync(string name)
        {
            return await _context.Tags
                .FirstOrDefaultAsync(t => t.Name.ToLower() == name.ToLower());
        }

        public async Task AddAsync(Tag tag)
        {
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Tag>> GetTagsForNoteAsync(int noteId)
        {
            return await _context.NoteTags
                .Where(nt => nt.NoteId == noteId)
                .Include(nt => nt.Tag)
                .Select(nt => nt.Tag)
                .ToListAsync();
        }

        public async Task<List<Tag>> ProcessTagsAsync(List<string> tagNames)
        {
            var tags = new List<Tag>();

            foreach (var name in tagNames.Distinct())
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == name);
                if (tag == null)
                {
                    tag = new Tag { Name = name };
                    _context.Tags.Add(tag);
                }
                tags.Add(tag);
            }

            await _context.SaveChangesAsync();
            return tags;
        }

        public async Task<bool> IsTagUsedAsync(int tagId)
        {
            return await _context.NoteTags.AnyAsync(nt => nt.TagId == tagId);
        }

        public async Task DeleteAsync(int tagId)
        {
            var tag = await _context.Tags.FindAsync(tagId);
            if (tag != null)
            {
                _context.Tags.Remove(tag);
                await _context.SaveChangesAsync();
            }
        }


    }
}
