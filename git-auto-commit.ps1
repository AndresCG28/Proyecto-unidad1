# Git Auto-Commit Script for Remindify
# Este script monitorea cambios en la carpeta y hace commits automáticamente.

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = Get-Location
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignorar la carpeta .git y archivos temporales
    if ($path -notmatch "\.git\\") {
        Write-Host "Cambio detectado: $name ($changeType). Haciendo commit..." -ForegroundColor Cyan
        git add .
        git commit -m "Auto-commit: Cambio detectado en $name"
        Write-Host "¡Commit realizado con éxito!" -ForegroundColor Green
    }
}

Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

Write-Host ">>> Monitoreo de Git iniciado en: $(Get-Location)" -ForegroundColor yellow
Write-Host ">>> Presiona Ctrl+C para detener." -ForegroundColor gray

while ($true) { Start-Sleep 5 }
