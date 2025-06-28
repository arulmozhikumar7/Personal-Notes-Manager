namespace PersonalNotesManager.DTOs
{
    public class NoteCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public bool IsPinned { get; set; } = false;
    }
}
