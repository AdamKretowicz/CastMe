namespace Application.Dtos
{
    public sealed record CastingParticipationDto
    {
        public Guid CastingId { get; init; }
        public Guid AssignmentId { get; init; }
        public string AssignmentStatus { get; init; } = string.Empty; // "Pending" | "Active" | "Rejected"
        public string Role { get; init; } = string.Empty;             // np. "Model"

        // Pola pomocnicze do wygodnego renderu kart (opcjonalne, ale bez fallbacków)
        public string? Title { get; init; }
        public DateTime? EventDate { get; init; }
        public string? Location { get; init; }
    }
}
