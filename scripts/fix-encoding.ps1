
$latin1 = [System.Text.Encoding]::GetEncoding(1252)
$utf8   = New-Object System.Text.UTF8Encoding $false
$corruptPattern = 'Ã|â€|Â·|Â°|Ãƒ|Ã‚'

$extensions = @("*.ts","*.tsx","*.html","*.md","*.mjs")
$files = Get-ChildItem "c:\Users\Uriel\PROJETS_GITHUB\medisense" -Recurse -Include $extensions |
  Where-Object { $_.FullName -notmatch "\\(node_modules|dist|\\.git)\\" }

foreach ($f in $files) {
  $pass = 0
  do {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    # Strip BOM
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
      $bytes = $bytes[3..($bytes.Length-1)]
    }
    $asUtf8 = [System.Text.Encoding]::UTF8.GetString($bytes)
    if ($asUtf8 -match $corruptPattern) {
      $fixed = $latin1.GetString($bytes)
      [System.IO.File]::WriteAllText($f.FullName, $fixed, $utf8)
      $pass++
    } else {
      break
    }
  } while ($pass -lt 6)
  
  if ($pass -gt 0) { Write-Host "Fixed ($pass passes): $($f.Name)" }
}
Write-Host "Done - all files processed"
