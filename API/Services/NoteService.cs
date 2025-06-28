using PersonalNotesManager.DTOs;
using PersonalNotesManager.Interfaces;
using PersonalNotesManager.Models;

namespace PersonalNotesManager.Services
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepo;
        private readonly ITagRepository _tagRepo;

        public NoteService(INoteRepository noteRepo, ITagRepository tagRepo)
        {
            _noteRepo = noteRepo;
            _tagRepo = tagRepo;
        }

        public async Task<List<NoteDto>> GetAllAsync()
        {
            var notes = await _noteRepo.GetAllAsync();
            return notes.Select(MapToDto).OrderByDescending(n => n.IsPinned).ThenByDescending(n => n.CreatedAt).ToList();
        }

        public async Task<NoteDto?> GetByIdAsync(int id)
        {
            var note = await _noteRepo.GetByIdAsync(id);
            return note is null ? null : MapToDto(note);
        }

        public async Task<Note?> GetEntityByIdAsync(int id)
        {
            return await _noteRepo.GetByIdAsync(id);
        }

        public async Task AddAsync(NoteCreateDto dto)
{
    var tags = await _tagRepo.ProcessTagsAsync(dto.Tags);

    var note = new Note
    {
        Title = dto.Title,
        Content = dto.Content,
        CreatedAt = DateTime.UtcNow,
        IsPinned = dto.IsPinned
    };

    note.NoteTags = tags.Select(t => new NoteTag
    {
        Tag = t,
        Note = note 
    }).ToList();

    await _noteRepo.AddAsync(note);
}


        public async Task UpdateAsync(int id, NoteUpdateDto dto)
        {
            var note = await _noteRepo.GetByIdAsync(id);
            if (note == null) return;

            var tags = await _tagRepo.ProcessTagsAsync(dto.Tags);

            note.Title = dto.Title;
            note.Content = dto.Content;
            note.IsPinned = dto.IsPinned;
            note.NoteTags = tags.Select(t => new NoteTag { Note = note, Tag = t }).ToList();

            await _noteRepo.UpdateAsync(note);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var note = await _noteRepo.GetByIdAsync(id);
            if (note == null) return false;

          
            var tagIds = note.NoteTags.Select(nt => nt.TagId).Distinct().ToList();

            await _noteRepo.DeleteAsync(id);

           
            foreach (var tagId in tagIds)
            {
                bool isUsed = await _tagRepo.IsTagUsedAsync(tagId);
                if (!isUsed)
                {
                    await _tagRepo.DeleteAsync(tagId);
                }
            }

            return true;
        }


        public async Task<bool> PinNoteAsync(int id)
        {
            var note = await _noteRepo.GetByIdAsync(id);
            if (note == null) return false;

            note.IsPinned = !note.IsPinned;
            await _noteRepo.UpdateAsync(note);
            return true;
        }

        public async Task<List<NoteDto>> SearchAsync(string keyword)
        {
            var notes = await _noteRepo.SearchAsync(keyword);
            return notes.Select(MapToDto).ToList();
        }

       public async Task<List<NoteDto>> FilterByTagsAsync(IEnumerable<string> tagNames)
        {
            var notes = await _noteRepo.FilterByTagsAsync(tagNames);
            return notes.Select(MapToDto).ToList();
        }

        private NoteDto MapToDto(Note note)
        {
            return new NoteDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                SavedAt = note.SavedAt,
                IsPinned = note.IsPinned,
                Tags = note.NoteTags.Select(nt => nt.Tag.Name).ToList()
            };
        }
    }
}
