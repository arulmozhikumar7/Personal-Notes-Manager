using PersonalNotesManager.Models;

namespace PersonalNotesManager.Interfaces
{
    public interface INoteRepository
    {
        Task<List<Note>> GetAllAsync();
        Task<Note?> GetByIdAsync(int id);
        Task<List<Note>> SearchAsync(string query);
        Task<List<Note>> FilterByTagsAsync(IEnumerable<string> tagNames);
        Task AddAsync(Note note);
        Task UpdateAsync(Note note);
        Task DeleteAsync(int id);
        Task<List<Note>> GetPinnedNotesAsync();
        Task<Note?> GetByIdWithTagsAsync(int id);

    }
}
