using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PersonalNotesManager.Models
{
    public class Note
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime SavedAt { get;set;} = DateTime.UtcNow;

        public bool IsPinned { get; set; } = false;

        // Navigation property to tags
        public List<NoteTag> NoteTags { get; set; } = new();
    }
}
