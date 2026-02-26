$path = 'D:\kevin\proyectos\2025\vidrierianino\vidrieria-nino\src\app\admin\suppliers\[id]\page.tsx'
$lines = [System.IO.File]::ReadAllLines($path)
# Keeps lines 0-655 (BranchesAndContactsPanel closing }) and 877+ (EditModal comment onward)
# Line indices are 0-based: keep [0..655] + [877..end]
$keep = @($lines[0..655]) + @($lines[877..($lines.Length - 1)])
[System.IO.File]::WriteAllLines($path, $keep, [System.Text.Encoding]::UTF8)
Write-Host "Done. Total lines: $($keep.Length)"
