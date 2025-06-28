using PersonalNotesManager.Models;
using PersonalNotesManager.Repositories;
using PersonalNotesManager.Interfaces;

namespace PersonalNotesManager.Services
{
    public class TagService : ITagService
    {
        private readonly ITagRepository _tagRepo;

        public TagService(ITagRepository tagRepo)
        {
            _tagRepo = tagRepo;
        }

        public async Task<List<Tag>> GetAllAsync()
        {
            return await _tagRepo.GetAllAsync();
        }

        public async Task<Tag?> GetByNameAsync(string name)
        {
            return await _tagRepo.GetByNameAsync(name);
        }

        public async Task<List<Tag>> ProcessTagsAsync(List<string> tagNames)
        {
            var tags = new List<Tag>();

            foreach (var name in tagNames.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                var tag = await _tagRepo.GetByNameAsync(name);
                if (tag == null)
                {
                    tag = new Tag { Name = name };
                    await _tagRepo.AddAsync(tag);
                }

                tags.Add(tag);
            }

            return tags;
        }
    }
}
