# PowerShell script to fix TypeScript service files
# - Changes import.meta.env to process.env
# - Changes @/types/* imports to relative paths

$rootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$srcDir = Join-Path $rootDir "src"
$serviceDir = Join-Path $srcDir "services"
$typesDir = Join-Path $srcDir "types"

function Get-RelativePath {
    param (
        [string]$from,
        [string]$to
    )
    
    $fromDir = Split-Path -Parent $from
    $relativePath = [System.IO.Path]::GetRelativePath($fromDir, $to)
    
    if (-not $relativePath.StartsWith(".")) {
        $relativePath = ".\" + $relativePath
    }
    
    return $relativePath.Replace("\", "/")
}

function Update-ServiceFile {
    param (
        [string]$filePath
    )
    
    Write-Host "Processing $filePath..."
    
    # Read file content
    $content = Get-Content -Path $filePath -Raw
    
    # Replace import.meta.env with process.env
    $content = $content -replace 'import\.meta\.env\.([A-Za-z0-9_]+)', 'process.env.$1'
    
    # Replace @/types imports with relative paths
    $typesRegEx = 'from\s+[''"]@\/types\/([^''"]*)[''"]'
    if ($content -match $typesRegEx) {
        $content = $content -replace $typesRegEx, {
            param($match)
            $typePath = $matches[1]
            $fullTypePath = Join-Path $typesDir "$typePath.ts"
            $relativePath = Get-RelativePath -from $filePath -to $fullTypePath
            # Remove .ts extension from import path
            $relativePath = $relativePath -replace '\.ts$', ''
            return "from '$relativePath'"
        }
    }
    
    # Write the updated content back to the file
    Set-Content -Path $filePath -Value $content
    Write-Host "Updated $filePath"
}

function Update-ServiceDirectory {
    param (
        [string]$dir
    )
    
    $files = Get-ChildItem -Path $dir
    
    foreach ($file in $files) {
        $filePath = $file.FullName
        
        if ($file.PSIsContainer) {            # Recursively process subdirectories
            Update-ServiceDirectory -dir $filePath
        }
        elseif ($file.Extension -eq ".ts") {            # Process TypeScript files
            Update-ServiceFile -filePath $filePath
        }
    }
}

# Main execution
Write-Host "Service Files TypeScript Compatibility Fixer"
Write-Host "============================================="
Write-Host "Converting:"
Write-Host "1. import.meta.env -> process.env"
Write-Host "2. @/types/* imports -> relative paths"
Write-Host "============================================="

try {
    Update-ServiceDirectory -dir $serviceDir
    Write-Host "All service files processed successfully!"
}
catch {
    Write-Host "Error processing files: $_"
    exit 1
}
