namespace RecoverySystem.Domain.Models;

public class Diagnosis
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string Symptoms { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public DateTime DateRecorded { get; set; }

    public Patient? Patient { get; set; }
}