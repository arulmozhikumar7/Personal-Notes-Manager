
namespace PersonalNotesManager.Models
{
    public class DraftTag
    {
        public int Id { get; set; }

        public int DraftId { get; set; }
        public required Draft Draft { get; set; } = null!;

        public int TagId { get; set; }
        public required Tag Tag { get; set; } = null!;
    }
}
