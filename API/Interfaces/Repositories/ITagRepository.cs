using PersonalNotesManager.Models;

namespace PersonalNotesManager.Interfaces
{
    public interface ITagRepository
    {
        Task<List<Tag>> GetAllAsync();
        Task<Tag?> GetByIdAsync(int id);
        Task<Tag?> GetByNameAsync(string name);
        Task AddAsync(Tag tag);
        Task<List<Tag>> GetTagsForNoteAsync(int noteId);
        Task<List<Tag>> ProcessTagsAsync(List<string> tagNames);
        Task<bool> IsTagUsedAsync(int tagId);
        Task DeleteAsync(int tagId);

    }
}
