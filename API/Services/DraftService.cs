using PersonalNotesManager.Models;
using PersonalNotesManager.Repositories;
using PersonalNotesManager.Interfaces;
using PersonalNotesManager.DTOs;

namespace PersonalNotesManager.Services
{
    public class DraftService : IDraftService
    {
        private readonly IDraftRepository _draftRepo;
        private readonly ITagRepository _tagRepo;

        public DraftService(IDraftRepository draftRepo, ITagRepository tagRepo)
        {
            _draftRepo = draftRepo;
            _tagRepo = tagRepo;
        }

        public async Task<List<DraftDto>> GetAllAsync()
        {
            var drafts = await _draftRepo.GetAllAsync();
            return drafts.Select(MapToDto).ToList();
        }

        public async Task<DraftDto?> GetByIdAsync(int id)
        {
            var draft = await _draftRepo.GetByIdAsync(id);
            return draft != null ? MapToDto(draft) : null;
        }

        public async Task AddOrUpdateAsync(DraftCreateDto dto, int? id = null)
        {
            var tags = await _tagRepo.ProcessTagsAsync(dto.Tags);
            Draft draft;

            if (id.HasValue)
            {
                draft = await _draftRepo.GetByIdAsync(id.Value) ?? new Draft { CreatedAt = DateTime.UtcNow };
                draft.Title = dto.Title;
                draft.Content = dto.Content;
                draft.SavedAt = DateTime.UtcNow;
            }
            else
            {
                draft = new Draft
                {
                    Title = dto.Title,
                    Content = dto.Content,
                    CreatedAt = DateTime.UtcNow,
                    SavedAt = DateTime.UtcNow
                };
            }

            draft.DraftTags = tags.Select(t => new DraftTag
            {
                Tag = t,
                Draft = draft // Required to resolve FK constraint
            }).ToList();

            if (id.HasValue)
                await _draftRepo.UpdateAsync(draft);
            else
                await _draftRepo.AddAsync(draft);
        }

        public async Task DeleteAsync(int id)
        {
            await _draftRepo.DeleteAsync(id);
        }

        private DraftDto MapToDto(Draft draft)
        {
            return new DraftDto
            {
                Id = draft.Id,
                Title = draft.Title ?? string.Empty,
                Content = draft.Content ?? string.Empty,
                SavedAt = draft.SavedAt,
                Tags = draft.DraftTags?.Select(dt => dt.Tag.Name).ToList() ?? new()
            };
        }
    }
}
