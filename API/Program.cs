using PersonalNotesManager.Data;
using PersonalNotesManager.Interfaces;
using PersonalNotesManager.Repositories;
using PersonalNotesManager.Services;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // Angular dev server
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

builder.Services.AddControllers();

var app = builder.Build();

// Enable middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
