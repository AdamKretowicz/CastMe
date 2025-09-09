using Application.Auth;
using Application.Interfaces;
using CastMe.Api.Features.Photos;
using CastMe.UserApi.Services;
using Infrastructure.Auth;
using Infrastructure.Context;
using Infrastructure.Security;
using Infrastructure.Settings;
using Infrastructure.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using WebApi.Extensions;
using WebApi.Infrastructure.Email;
using WebApi.Services;
using WebApi.Services.Photo;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddNewtonsoftJson();

// Swagger z Bearer do logowania na testy
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // >>> DODANE: definicja dokumentu v1, żeby /swagger/v1/swagger.json działało
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CastMe WebApi", Version = "v1" });

    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Wpisz: Bearer {token}"
    };
    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [scheme] = Array.Empty<string>() });
    c.CustomSchemaIds(type => type.FullName.Replace("+", "."));
});

// >>> DODANE: wsparcie dla Newtonsoft w Swaggerze
builder.Services.AddSwaggerGenNewtonsoftSupport();

// DbContext z SQL Server (ConnectionString w appsettings.json)
builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Db"),
        sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "User")
    )
);

// Opcje JWT (POCO w Infrastructure/Auth)
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// Opcje SMTP
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SMTP"));

// DI: bezpieczeństwo
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();

// Authentication – JWT Bearer
var jwt = builder.Configuration.GetSection("Jwt");
var issuer = jwt["Issuer"];
var audience = jwt["Audience"];
var key = jwt["Key"];

if (string.IsNullOrWhiteSpace(key))
{
    throw new InvalidOperationException("Missing JWT key. Set 'Jwt:Key' in appsettings/Secrets/ENV.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

// Utworzone serwisy 
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<CastingService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();

builder.Services.Configure<LocalStorageOptions>(builder.Configuration.GetSection("LocalStorage"));
builder.Services.AddScoped<IImageStorage, LocalImageStorage>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

var app = builder.Build();
// Middleware do autoryzacji ról (własny)
app.UseMiddleware<RoleAuthorizationMiddleware>();


app.UseStaticFiles();

// Swagger (tu włączam zawsze; jeśli chcesz tylko w DEV, owiń w if)
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "CastMe WebApi v1"));

app.UseHttpsRedirection();

app.UseAuthentication();   // WAŻNE: przed UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
