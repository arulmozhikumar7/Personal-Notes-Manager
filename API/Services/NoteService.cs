using PersonalNotesManager.DTOs;
using PersonalNotesManager.Interfaces;
using PersonalNotesManager.Models;

namespace PersonalNotesManager.Services
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepo;
        private readonly ITagRepository _tagRepo;
        private readonly PdfExportService _pdfExportService;
        private readonly HtmlExportService _htmlExportService;
        private readonly ImageExportService _imageExportService;
        private readonly FeatureFlags _featureFlags;

        public NoteService(
            INoteRepository noteRepo,
            ITagRepository tagRepo,
            PdfExportService pdfExportService,
            ImageExportService imageExportService,
             HtmlExportService htmlExportService,
             FeatureFlags featureFlags)
        {
            _noteRepo = noteRepo;
            _tagRepo = tagRepo;
            _pdfExportService = pdfExportService;
            _imageExportService = imageExportService;
            _htmlExportService = htmlExportService;
            _featureFlags = featureFlags;
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

    // Store the original tag IDs before update
    var originalTagIds = note.NoteTags.Select(nt => nt.TagId).ToList();

    // Process updated tags
    var updatedTags = await _tagRepo.ProcessTagsAsync(dto.Tags);
    var updatedTagIds = updatedTags.Select(t => t.Id).ToList();

   
    note.Title = dto.Title;
    note.Content = dto.Content;
    note.IsPinned = dto.IsPinned;
    note.NoteTags = updatedTags.Select(t => new NoteTag { Note = note, Tag = t }).ToList();

    await _noteRepo.UpdateAsync(note);

   
    var removedTagIds = originalTagIds.Except(updatedTagIds);
    foreach (var tagId in removedTagIds)
    {
        bool isUsed = await _tagRepo.IsTagUsedAsync(tagId);
        if (!isUsed)
        {
            await _tagRepo.DeleteAsync(tagId);
        }
    }
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

    public async Task<byte[]?> ExportNoteAsPdfAsync(int id)
{
    if (!_featureFlags.EnablePdfExport)
        throw new InvalidOperationException("PDF export is disabled by feature flag.");

    var note = await _noteRepo.GetByIdAsync(id);
    if (note == null) return null;

    var dto = MapToDto(note);
    return await _pdfExportService.ExportNoteToPdfAsync(dto.Title, dto.Tags, dto.Content);
}

public async Task<byte[]?> ExportNoteAsImageAsync(int id)
{
    if (!_featureFlags.EnableImageExport)
        throw new InvalidOperationException("Image export is disabled by feature flag.");

    var note = await _noteRepo.GetByIdAsync(id);
    if (note == null) return null;

    var dto = MapToDto(note);
    return await _imageExportService.ExportNoteToImageAsync(dto.Title, dto.Tags, dto.Content);
}

public async Task<byte[]?> ExportNoteAsHtmlAsync(int id)
{
    if (!_featureFlags.EnableHtmlExport)
        throw new InvalidOperationException("HTML export is disabled by feature flag.");

    var note = await _noteRepo.GetByIdAsync(id);
    if (note == null) return null;

    var dto = MapToDto(note);
    return await _htmlExportService.ExportNoteToHtmlAsync(dto.Title, dto.Tags, dto.Content);
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
