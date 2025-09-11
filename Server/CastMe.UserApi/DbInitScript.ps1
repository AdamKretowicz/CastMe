# 1. Start SQL Server container
docker-compose -f .\castme.userApi\docker-compose.yml up -d

# 2. Wait a bit for SQL Server to be ready
Write-Host "⏳ Waiting for SQL Server to start..."
Start-Sleep -Seconds 15

# 3. Drop existing database if it exists
Write-Host "🗑️ Dropping existing database if it exists..."
dotnet ef database drop `
  --project .\CastMe.User.Storage `
  --startup-project .\castme.userApi `
  --force

# 4. Apply EF Core migrations (this will recreate the database)
Write-Host "🔄 Creating database and applying migrations..."
dotnet ef database update `
  --project .\CastMe.User.Storage `
  --startup-project .\castme.userApi