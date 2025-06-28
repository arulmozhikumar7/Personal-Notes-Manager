using PersonalNotesManager.Models;

namespace PersonalNotesManager.Interfaces
{
    public interface ITagService
    {
        Task<List<Tag>> GetAllAsync();
        Task<Tag?> GetByNameAsync(string name);
        Task<List<Tag>> ProcessTagsAsync(List<string> tagNames);
    }
}
