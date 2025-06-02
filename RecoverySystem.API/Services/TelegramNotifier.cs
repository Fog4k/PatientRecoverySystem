using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace RecoverySystem.API.Services;

public class TelegramNotifier
{
    private readonly HttpClient _httpClient;
    private readonly string _botToken;

    public TelegramNotifier(IConfiguration config)
    {
        _httpClient = new HttpClient();
        _botToken = config["Telegram:BotToken"] ?? "";
    }

    public async Task SendMessageAsync(string chatId, string message)
    {
        if (string.IsNullOrEmpty(_botToken) || string.IsNullOrEmpty(chatId))
            return;

        var url = $"https://api.telegram.org/bot{_botToken}/sendMessage";
        var content = new StringContent(JsonSerializer.Serialize(new
        {
            chat_id = chatId,
            text = message
        }), Encoding.UTF8, "application/json");

        await _httpClient.PostAsync(url, content);
    }
}