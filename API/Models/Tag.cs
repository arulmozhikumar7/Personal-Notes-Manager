using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PersonalNotesManager.Models
{
    public class Tag
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public List<NoteTag> NoteTags { get; set; } = new();
    }
}
