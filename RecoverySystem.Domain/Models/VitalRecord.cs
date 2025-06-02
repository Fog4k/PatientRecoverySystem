namespace RecoverySystem.Domain.Models;

public class VitalRecord
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public float Temperature { get; set; }
    public int BloodPressureSystolic { get; set; }
    public int BloodPressureDiastolic { get; set; }
    public int Pulse { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }

    public Patient? Patient { get; set; }
}