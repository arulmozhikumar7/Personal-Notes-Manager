using PersonalNotesManager.Models;

namespace PersonalNotesManager.Interfaces
{
    public interface IDraftRepository
    {
        Task<List<Draft>> GetAllAsync();
        Task<Draft?> GetByIdAsync(int id);
        Task<Draft?> GetLatestAsync();
        Task AddAsync(Draft draft);
        Task UpdateAsync(Draft draft);
        Task DeleteAsync(int id);
        Task DeleteAllAsync();
    }
}
