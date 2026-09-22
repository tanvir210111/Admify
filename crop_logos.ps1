Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path (Get-Location) "pictures\logo.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. Emblem icon crop (the 3D A + globe + airplane): x: 440, y: 100, width: 656, height: 460
$rectIcon = New-Object System.Drawing.Rectangle(440, 95, 656, 465)
$cropIcon = $src.Clone($rectIcon, $src.PixelFormat)
$cropIcon.Save((Join-Path (Get-Location) "public\logo-mark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$cropIcon.Dispose()

# 2. Combined Emblem + ADMIFY text crop: x: 300, y: 95, width: 936, height: 630
$rectCombo = New-Object System.Drawing.Rectangle(300, 95, 936, 630)
$cropCombo = $src.Clone($rectCombo, $src.PixelFormat)
$cropCombo.Save((Join-Path (Get-Location) "public\logo-combo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$cropCombo.Dispose()

# 3. Square Avatar crop centered on the emblem for round / square icons: x: 470, y: 80, width: 596, height: 596
$rectSquare = New-Object System.Drawing.Rectangle(470, 70, 600, 600)
$cropSquare = $src.Clone($rectSquare, $src.PixelFormat)
# 4. Generate 64x64 favicon.png
$thumb = New-Object System.Drawing.Bitmap(64, 64)
$g = [System.Drawing.Graphics]::FromImage($thumb)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$destRect = New-Object System.Drawing.Rectangle(0, 0, 64, 64)
$g.DrawImage($src, $destRect, $rectIcon, [System.Drawing.GraphicsUnit]::Pixel)
$thumb.Save((Join-Path (Get-Location) "public\favicon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$thumb.Dispose()

$cropIcon.Dispose()
$src.Dispose()
Write-Host "Logo crops and favicon generated successfully."
