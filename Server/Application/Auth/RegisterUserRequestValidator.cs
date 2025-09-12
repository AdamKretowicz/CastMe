using CastMe.User.CrossCutting.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Auth
{
    public class UserCreateValidator : AbstractValidator<UserDto.Create>
    {
        public UserCreateValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Nazwa użytkownika jest wymagana")
                .MaximumLength(50).WithMessage("Nazwa użytkownika nie może być dłuższa niż 50 znaków")
                .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("Nazwa użytkownika może zawierać tylko litery, cyfry, myślniki i podkreślenia");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email jest wymagany")
                .EmailAddress().WithMessage("Nieprawidłowy format adresu email")
                .MaximumLength(255).WithMessage("Email nie może być dłuższy niż 255 znaków");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Imię jest wymagane")
                .MaximumLength(100).WithMessage("Imię nie może być dłuższe niż 100 znaków")
                .Matches(@"^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$").WithMessage("Imię może zawierać tylko litery");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Nazwisko jest wymagane")
                .MaximumLength(100).WithMessage("Nazwisko nie może być dłuższe niż 100 znaków")
                .Matches(@"^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$").WithMessage("Nazwisko może zawierać tylko litery");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Hasło jest wymagane")
                .MinimumLength(8).WithMessage("Hasło musi mieć minimum 8 znaków")
                .MaximumLength(100).WithMessage("Hasło nie może być dłuższe niż 100 znaków")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])")
                .WithMessage("Hasło musi zawierać: wielką literę, małą literę, cyfrę i znak specjalny");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Numer telefonu jest wymagany")
                .Matches(@"^(\+48\s?)?[\d\s\-\(\)]{9,15}$").WithMessage("Nieprawidłowy format polskiego numeru telefonu");

            RuleFor(x => x.DateOfBirth)
                .NotEmpty().WithMessage("Data urodzenia jest wymagana")
                .Must(BeValidAge).WithMessage("Użytkownik musi mieć co najmniej 16 lat")
                .Must(BeRealisticAge).WithMessage("Data urodzenia nie może być wcześniejsza niż 100 lat temu");

            When(x => x.RoleName.Equals("Model", StringComparison.OrdinalIgnoreCase), () =>
            {
                RuleFor(x => x.Height)
                    .NotEmpty().WithMessage("Wzrost jest wymagany")
                    .GreaterThanOrEqualTo(80).WithMessage("Wzrost musi być co najmniej 80 cm")
                    .LessThanOrEqualTo(300).WithMessage("Wzrost nie może być większy niż 300 cm");

                RuleFor(x => x.Weight)
                    .NotEmpty().WithMessage("Waga jest wymagana")
                    .GreaterThanOrEqualTo(20).WithMessage("Waga musi być co najmniej 20 kg")
                    .LessThanOrEqualTo(300).WithMessage("Waga nie może być większa niż 300 kg");

                RuleFor(x => x.HairColor)
                    .NotEmpty().WithMessage("Kolor włosów jest wymagany")
                    .MaximumLength(50).WithMessage("Kolor włosów nie może być dłuższy niż 50 znaków");

                RuleFor(x => x.ClothingSize)
                    .NotEmpty().WithMessage("Rozmiar odzieży jest wymagany")
                    .MaximumLength(10).WithMessage("Rozmiar odzieży nie może być dłuższy niż 10 znaków")
                    .Matches(@"^(XS|S|M|L|XL|XXL|XXXL|\d{2,3})$").WithMessage("Nieprawidłowy rozmiar odzieży");

                RuleFor(x => x.Photos)
                    .NotEmpty().WithMessage("Musisz przesłać co najmniej jedno zdjęcie")
                    .Must(x => x != null && x.Length >= 1).WithMessage("Musisz przesłać co najmniej jedno zdjęcie");
            });

            When(x => x.RoleName.Equals("Designer", StringComparison.OrdinalIgnoreCase)
                  || x.RoleName.Equals("Photographer", StringComparison.OrdinalIgnoreCase), () =>
                  {
                      RuleFor(x => x.Photos)
                      .NotEmpty().WithMessage("Musisz przesłać co najmniej jedno zdjęcie")
                      .Must(x => x != null && x.Length >= 1).WithMessage("Musisz przesłać co najmniej jedno zdjęcie");
                  });



            RuleForEach(x => x.Photos)
                .SetValidator(new PhotoUploadDtoValidator());

            RuleFor(x => x.RoleName)
                .NotEmpty().WithMessage("Rola jest wymagana");

            RuleFor(x => x.AcceptTerms)
                .Equal(true).WithMessage("Musisz zaakceptować regulamin");
        }

        private static bool BeValidAge(DateTime dateOfBirth)
        {
            var age = DateTime.UtcNow.Year - dateOfBirth.Year;
            if (dateOfBirth > DateTime.UtcNow.AddYears(-age)) age--;
            return age >= 16;
        }

        private static bool BeRealisticAge(DateTime dateOfBirth)
        {
            return dateOfBirth >= DateTime.UtcNow.AddYears(-100);
        }
    }


    public class PhotoUploadDtoValidator : AbstractValidator<IFormFile>
    {
        public PhotoUploadDtoValidator()
        {
            RuleFor(x => x)
                .NotNull().WithMessage("Plik jest wymagany")
                .Must(BeValidFileSize).WithMessage("Rozmiar pliku nie może przekroczyć 5MB")
                .Must(BeValidImageType).WithMessage("Dozwolone są tylko pliki graficzne (JPEG, PNG, WebP)");
        }

        private static bool BeValidFileSize(IFormFile? file)
        {
            return file != null && file.Length <= 5 * 1024 * 1024; // 5MB
        }

        private static bool BeValidImageType(IFormFile? file)
        {
            if (file == null) return false;
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            return allowedTypes.Contains(file.ContentType.ToLower());
        }
    }

}
