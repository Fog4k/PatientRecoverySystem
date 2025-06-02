using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;
using RecoverySystem.Domain.Models;

namespace RecoverySystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Doctor,Nurse,Admin")]
public class PatientPhotoController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public PatientPhotoController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpPost("{id}/upload")]
    public async Task<IActionResult> Upload(int id, IFormFile file)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null)
            return NotFound("Пациент не найден");

        if (file == null || file.Length == 0)
            return BadRequest("Файл пуст");

        var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "patients");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"patient_{id}{ext}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        patient.PhotoUrl = $"/images/patients/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { photoUrl = patient.PhotoUrl });
    }
}