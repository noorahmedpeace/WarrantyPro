Write-Host "1. Testing Login..."
try {
    $login = Invoke-RestMethod -Uri 'http://localhost:3000/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body (ConvertTo-Json @{email='noorahmedgaming@gmail.com';password='password123'})
    $token = $login.token
    if (-not $token) { throw "No token returned" }
    Write-Host "   Login Successful."
} catch {
    Write-Host "   Login Failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "2. Creating Warranty..."
try {
    $headers = @{Authorization=("Bearer " + $token); 'Content-Type'='application/json'}
    $body = @{
        product_name='Test Persistence Product'
        brand='Test Brand'
        purchase_date='2024-02-12'
        warranty_duration_months=24
    } | ConvertTo-Json
    
    $warranty = Invoke-RestMethod -Uri 'http://localhost:3000/warranties' -Method POST -Headers $headers -Body $body
    Write-Host "   Warranty Created: $($warranty.id)"
} catch {
     Write-Host "   Warranty Creation Failed: $($_.Exception.Message)"
     exit 1
}

Write-Host "3. Verifying Persistence..."
if (Test-Path "data\warranties.json") {
    Write-Host "   SUCCESS: data\warranties.json exists."
} else {
    Write-Host "   FAILURE: data\warranties.json does NOT exist."
}
