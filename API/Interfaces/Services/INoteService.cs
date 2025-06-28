using PersonalNotesManager.DTOs;
using PersonalNotesManager.Models;

namespace PersonalNotesManager.Interfaces
{
    public interface INoteService
    {
        Task<List<NoteDto>> GetAllAsync();
        Task<NoteDto?> GetByIdAsync(int id);
        Task<Note?> GetEntityByIdAsync(int id); // for internal usage
        Task AddAsync(NoteCreateDto dto);
        Task UpdateAsync(int id, NoteUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> PinNoteAsync(int id);
        Task<List<NoteDto>> SearchAsync(string keyword);
        Task<List<NoteDto>> FilterByTagsAsync(IEnumerable<string> tagNames);
    }
}
