# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY ["CastMe.sln", "./"]

# Copy csproj files with correct folder names
COPY ["Application/Application.csproj", "Application/"]
COPY ["CastMe.User.Storage/Infrastructure.csproj", "CastMe.User.Storage/"]
COPY ["CastMe.UserApi/WebApi.csproj", "CastMe.UserApi/"]
COPY ["Domain/Domain.csproj", "Domain/"]

# Restore dependencies
RUN dotnet restore "CastMe.UserApi/WebApi.csproj"

# Copy all files
COPY . .

# Build and publish
WORKDIR "/src/CastMe.UserApi"
RUN dotnet publish "WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port for Azure or local mapping
EXPOSE 8080

ENTRYPOINT ["dotnet", "WebApi.dll"]
