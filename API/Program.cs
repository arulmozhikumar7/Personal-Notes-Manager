using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using PersonalNotesManager.Data;
using PersonalNotesManager.Interfaces;
using PersonalNotesManager.Models;
using PersonalNotesManager.Repositories;
using PersonalNotesManager.Services;
using Serilog;

// Configure Serilog 
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .CreateLogger();

try
{
    Log.Information("Starting up the application");

    var builder = WebApplication.CreateBuilder(args);

    
    builder.Host.UseSerilog();

   
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Repositories
    builder.Services.AddScoped<INoteRepository, NoteRepository>();
    builder.Services.AddScoped<ITagRepository, TagRepository>();
    builder.Services.AddScoped<IDraftRepository, DraftRepository>();

    // Services
    builder.Services.AddScoped<INoteService, NoteService>();
    builder.Services.AddScoped<ITagService, TagService>();
    builder.Services.AddScoped<IDraftService, DraftService>();
    builder.Services.AddScoped<PdfExportService>();
    builder.Services.AddScoped<ImageExportService>();
    builder.Services.AddScoped<HtmlExportService>();
    builder.Services.Configure<FeatureFlags>(
        builder.Configuration.GetSection("FeatureFlags"));

    var featureFlags = builder.Configuration
        .GetSection("FeatureFlags")
        .Get<FeatureFlags>() ?? new FeatureFlags();
    builder.Services.AddSingleton(featureFlags);

    builder.Services.AddControllers();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors("AllowFrontend");

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start correctly.");
}
finally
{
    Log.CloseAndFlush();
}
