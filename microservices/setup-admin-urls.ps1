# Quick Setup Script for Adding ADMIN_SERVICE_URL to All Microservices
# PowerShell Script

Write-Host "Setting up Admin Service URL for all microservices..." -ForegroundColor Cyan

$services = @(
    "auth-service",
    "quiz-service",
    "result-service",
    "live-service",
    "social-service",
    "gamification-service",
    "moderation-service",
    "meeting-service",
    "api-gateway"
)

$basePath = "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices"

# For local development
$localAdminUrl = "ADMIN_SERVICE_URL=http://localhost:3011"

foreach ($service in $services) {
    $envFile = Join-Path $basePath "$service\.env"
    
    Write-Host ""
    Write-Host "Processing $service..." -ForegroundColor Yellow
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw
        
        if ($content -match "ADMIN_SERVICE_URL") {
            Write-Host "  [OK] ADMIN_SERVICE_URL already exists in $service" -ForegroundColor Green
        }
        else {
            Add-Content -Path $envFile -Value "`n# Admin Service for centralized logging and monitoring"
            Add-Content -Path $envFile -Value $localAdminUrl
            Write-Host "  [DONE] Added ADMIN_SERVICE_URL to $service" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  [INFO] .env file not found for $service" -ForegroundColor Magenta
    }
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Admin Service URL: http://localhost:3011" -ForegroundColor White
Write-Host "Services configured: $($services.Count)" -ForegroundColor White
