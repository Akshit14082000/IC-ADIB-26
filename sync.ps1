# IC-ADIB-26 Sync Script
# Automatically adds all changes, commits with a timestamp, and pushes to master.

Write-Host "🚀 Starting Sync..." -ForegroundColor Cyan

# Add all changes
git add .

# Prompt for a commit message (optional)
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$msg = Read-Host "Enter commit message (default: 'Site update $timestamp')"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "Site update $timestamp"
}

# Commit
git commit -m "$msg"

# Push
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host "✅ Sync Complete! Your updates are on their way to the live site." -ForegroundColor Green
Write-Host "Link: https://Akshit14082000.github.io/IC-ADIB-26/" -ForegroundColor White
