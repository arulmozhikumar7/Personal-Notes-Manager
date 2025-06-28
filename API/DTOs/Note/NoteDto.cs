namespace PersonalNotesManager.DTOs
{
    public class NoteDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime SavedAt { get; set; }
        public bool IsPinned { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
