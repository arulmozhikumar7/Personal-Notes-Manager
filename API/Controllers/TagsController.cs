using Microsoft.AspNetCore.Mvc;
using PersonalNotesManager.Services;
using PersonalNotesManager.Interfaces;
using PersonalNotesManager.Models;
using PersonalNotesManager.DTOs;

namespace PersonalNotesManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly ITagService _tagService;

        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _tagService.GetAllAsync();

            var tagNames = tags
                .Select(t => t.Name)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(name => name)
                .ToList();

            return Ok(ApiResponse<List<string>>.SuccessResponse(tagNames, "All tags retrieved"));
        }
    }
}
