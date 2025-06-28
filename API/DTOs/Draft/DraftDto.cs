namespace PersonalNotesManager.DTOs
{
    public class DraftDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public DateTime SavedAt { get; set; }

        public List<string> Tags { get; set; } = new();
    }
}
