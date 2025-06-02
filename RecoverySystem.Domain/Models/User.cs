namespace RecoverySystem.Domain.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    // 👇 Добавлено новое поле
    public string? TelegramChatId { get; set; }
}