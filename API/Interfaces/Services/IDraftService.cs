using PersonalNotesManager.DTOs;

namespace PersonalNotesManager.Interfaces
{
    public interface IDraftService
    {
        Task<List<DraftDto>> GetAllAsync();
        Task<DraftDto?> GetByIdAsync(int id);
        Task AddOrUpdateAsync(DraftCreateDto dto, int? id = null);
        Task DeleteAsync(int id);
    }
}
