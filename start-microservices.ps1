# Start All Microservices for Cognito Learning Hub
# Run this script from the root directory

Write-Host "Starting Cognito Learning Hub Microservices..." -ForegroundColor Cyan
Write-Host ""

# Array of services to start
$services = @(
    @{Name="API Gateway"; Path="microservices\api-gateway"; Port=8000},
    @{Name="Auth Service"; Path="microservices\auth-service"; Port=3001},
    @{Name="Quiz Service"; Path="microservices\quiz-service"; Port=3002},
    @{Name="Result Service"; Path="microservices\result-service"; Port=3003},
    @{Name="Live Service"; Path="microservices\live-service"; Port=3004},
    @{Name="Social Service"; Path="microservices\social-service"; Port=3006},
    @{Name="Gamification Service"; Path="microservices\gamification-service"; Port=3007},
    @{Name="Avatar Service"; Path="microservices\avatar-service"; Port=3008},
    @{Name="Meeting Service"; Path="microservices\meeting-service"; Port=3009},
    @{Name="Moderation Service"; Path="microservices\moderation-service"; Port=3010}
)

foreach ($service in $services) {
    Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Green
    
    # Start each service in a new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($service.Path)'; Write-Host 'Starting $($service.Name) - Port $($service.Port)' -ForegroundColor Yellow; npm start"
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "All microservices are starting in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  - $($service.Name): http://localhost:$($service.Port)" -ForegroundColor White
}
Write-Host ""
Write-Host "Main Entry Point: http://localhost:8000 (API Gateway)" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop all services, close all PowerShell windows" -ForegroundColor Gray

