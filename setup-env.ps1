# Setup script for Quiz Generator .env file
$envPath = Join-Path $PSScriptRoot "server\.env"

Write-Host "=== Quiz Generator API Key Setup ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists at: $envPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "To get your Gemini API key:" -ForegroundColor Green
Write-Host "1. Visit: https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Sign in with your Google account" -ForegroundColor White
Write-Host "3. Click 'Create API Key'" -ForegroundColor White
Write-Host "4. Copy the API key" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host "Enter your Gemini API key (or press Enter to use placeholder)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    $apiKey = "your_api_key_here"
    Write-Host "⚠️  Using placeholder. You'll need to update it later." -ForegroundColor Yellow
}

$envContent = @"
GEMINI_API_KEY=$apiKey
PORT=5000
"@

try {
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Host ""
    Write-Host "✓ .env file created successfully at: $envPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. If you used a placeholder, update the API key in the .env file" -ForegroundColor White
    Write-Host "2. Restart the backend server (stop with Ctrl+C, then run: cd server && npm start)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Error creating .env file: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create the file manually:" -ForegroundColor Yellow
    Write-Host "1. Create a file named '.env' in the 'server' folder" -ForegroundColor White
    Write-Host "2. Add this content:" -ForegroundColor White
    Write-Host "   GEMINI_API_KEY=your_api_key_here" -ForegroundColor Gray
    Write-Host "   PORT=5000" -ForegroundColor Gray
}
