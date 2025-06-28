namespace PersonalNotesManager.Models
{
    public class Draft
    {
        public int Id { get; set; }

        public string? Title { get; set; }

        public string? Content { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<DraftTag>? DraftTags { get; set; } // Replaces NoteTags
    }
}
