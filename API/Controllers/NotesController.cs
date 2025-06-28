using Microsoft.AspNetCore.Mvc;
using PersonalNotesManager.DTOs;
using PersonalNotesManager.Interfaces;

namespace PersonalNotesManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notes = await _noteService.GetAllAsync();
            return Ok(ApiResponse<List<NoteDto>>.SuccessResponse(notes, "Notes fetched successfully"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var note = await _noteService.GetByIdAsync(id);
            if (note is null)
                return NotFound(ApiResponse<NoteDto>.ErrorResponse("Note not found"));

            return Ok(ApiResponse<NoteDto>.SuccessResponse(note, "Note retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NoteCreateDto dto)
        {
            await _noteService.AddAsync(dto);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Note created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NoteUpdateDto dto)
        {
            var note = await _noteService.GetByIdAsync(id);
            if (note is null)
                return NotFound(ApiResponse<object>.ErrorResponse("Note not found"));

            await _noteService.UpdateAsync(id, dto);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Note updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _noteService.DeleteAsync(id);
            if (!success)
                return NotFound(ApiResponse<object>.ErrorResponse("Note not found"));

            return Ok(ApiResponse<object>.SuccessResponse(null, "Note deleted successfully"));
        }

        [HttpPatch("{id}/pin")]
        public async Task<IActionResult> TogglePin(int id)
        {
            var success = await _noteService.PinNoteAsync(id);
            if (!success)
                return NotFound(ApiResponse<object>.ErrorResponse("Note not found"));

            return Ok(ApiResponse<object>.SuccessResponse(null, "Note pin toggled successfully"));
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            var results = await _noteService.SearchAsync(keyword);
            return Ok(ApiResponse<List<NoteDto>>.SuccessResponse(results, "Search completed"));
        }

        [HttpGet("tags")]
        public async Task<IActionResult> FilterByTags([FromQuery] List<string> tags)
        {
            var results = await _noteService.FilterByTagsAsync(tags);
            return Ok(ApiResponse<List<NoteDto>>.SuccessResponse(results, "Notes filtered by tags."));
        }

        [HttpGet("{id}/export")]
        public async Task<IActionResult> ExportPdf(int id)
        {
            var pdfBytes = await _noteService.ExportNoteAsPdfAsync(id);
            if (pdfBytes == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Note not found"));

            return File(pdfBytes, "application/pdf", $"Note_{id}.pdf");
        }

        [HttpGet("{id}/export/image")]
        public async Task<IActionResult> ExportNoteImage(int id)
        {
            var imageBytes = await _noteService.ExportNoteAsImageAsync(id);
            if (imageBytes == null) return NotFound();

            return File(imageBytes, "image/png", $"note-{id}.png");
        }

        [HttpGet("notes/{id}/export/html")]
        public async Task<IActionResult> ExportNoteAsHtml(int id)
        {
            var bytes = await _noteService.ExportNoteAsHtmlAsync(id);
            if (bytes == null) return NotFound();

            var fileName = $"Note_{id}.html";
            return File(bytes, "text/html", fileName);
        }

    }
}
