using Microsoft.AspNetCore.Mvc;
using PersonalNotesManager.DTOs;
using PersonalNotesManager.Interfaces;

namespace PersonalNotesManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DraftsController : ControllerBase
    {
        private readonly IDraftService _draftService;

        public DraftsController(IDraftService draftService)
        {
            _draftService = draftService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var drafts = await _draftService.GetAllAsync();
            return Ok(ApiResponse<List<DraftDto>>.SuccessResponse(drafts, "Drafts retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var draft = await _draftService.GetByIdAsync(id);
            if (draft == null)
                return NotFound(ApiResponse<DraftDto>.ErrorResponse("Draft not found"));

            return Ok(ApiResponse<DraftDto>.SuccessResponse(draft, "Draft retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DraftCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest(ApiResponse<object>.ErrorResponse("Title and Content are required."));

            await _draftService.AddOrUpdateAsync(dto);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Draft created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] DraftCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest(ApiResponse<object>.ErrorResponse("Title and Content are required."));

            await _draftService.AddOrUpdateAsync(dto, id);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Draft updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _draftService.GetByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Draft not found"));

            await _draftService.DeleteAsync(id);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Draft deleted successfully"));
        }
    }
}
