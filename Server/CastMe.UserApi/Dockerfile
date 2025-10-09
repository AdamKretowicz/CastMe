# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file if you have one
# COPY ["CastMe.sln", "./"]

# Copy project files
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["CastMe.User.Storage/Infrastructure.csproj", "CastMe.User.Storage/"]
COPY ["CastMe.UserApi/WebApi.csproj", "CastMe.UserApi/"]

# If using private NuGet feed, copy NuGet.Config (optional)
# COPY ["NuGet.Config", "./"]

# Restore dependencies (automatically downloads all NuGet packages)
RUN dotnet restore "CastMe.UserApi/WebApi.csproj"

# Copy all source files
COPY ["Domain/", "Domain/"]
COPY ["Application/", "Application/"]
COPY ["CastMe.User.Storage/", "CastMe.User.Storage/"]
COPY ["CastMe.UserApi/", "CastMe.UserApi/"]

# Build the application
WORKDIR "/src/CastMe.UserApi"
RUN dotnet build "WebApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks (optional)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published files
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the application
ENTRYPOINT ["dotnet", "WebApi.dll"]