# Regenerates the platform icon set from the CampusNow logo artwork.
#
#   assets/images/logo.png        the mark on its own white canvas (source of truth)
#   assets/images/logo-no-bg.png  the mark with a transparent background
#
# Outputs (all safe to overwrite, all committed with the app):
#   icon.png                     legacy launcher icon
#   favicon.png                  web favicon
#   android-icon-foreground.png  adaptive icon foreground, inside Android's safe zone
#   android-icon-background.png  adaptive icon background (white)
#   android-icon-monochrome.png  themed-icon silhouette
#
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1

Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..\assets\images'
$logo = (Resolve-Path (Join-Path $root 'logo.png')).Path
$mark = (Resolve-Path (Join-Path $root 'logo-no-bg.png')).Path

function New-Square([int]$size, [string]$background) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  if ($background) {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($background))
  } else {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  }
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

# Draws $source centred in the canvas, filling $fill of the canvas width.
function Add-CentredMark($canvas, [string]$source, [double]$fill) {
  $side = $canvas.Bitmap.Width
  $image = [System.Drawing.Image]::FromFile($source)
  $scale = ($side * $fill) / $image.Width
  $width = [int]($image.Width * $scale)
  $height = [int]($image.Height * $scale)
  $canvas.Graphics.DrawImage($image, [int](($side - $width) / 2), [int](($side - $height) / 2), $width, $height)
  $image.Dispose()
}

function Save-Icon($canvas, [string]$name) {
  $canvas.Graphics.Dispose()
  $path = Join-Path $root $name
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Bitmap.Dispose()
  Write-Output "wrote $name"
}

# Launcher icon: the logo artwork exactly as designed, on its white canvas.
$icon = New-Square 1024 '#FFFFFF'
Add-CentredMark $icon $logo 1.0
Save-Icon $icon 'icon.png'

# Adaptive icon foreground: mark only, sized to sit inside Android's safe zone
# (the 66dp circle inside the 108dp adaptive canvas, i.e. ~61% of the tile).
$foreground = New-Square 512 $null
Add-CentredMark $foreground $mark 0.66
Save-Icon $foreground 'android-icon-foreground.png'

# Adaptive icon background: flat white, so the mark reads on every launcher.
$background = New-Square 512 '#FFFFFF'
Save-Icon $background 'android-icon-background.png'

# Themed (monochrome) icon: the mark's silhouette, painted in pure black.
$mono = New-Square 432 $null
Add-CentredMark $mono $mark 0.66
$silhouette = New-Object System.Drawing.Bitmap(432, 432, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt 432; $y += 1) {
  for ($x = 0; $x -lt 432; $x += 1) {
    $pixel = $mono.Bitmap.GetPixel($x, $y)
    if ($pixel.A -gt 0) {
      $silhouette.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, 0, 0, 0))
    }
  }
}
$mono.Graphics.DrawImage($silhouette, 0, 0, 432, 432)
$silhouette.Dispose()
Save-Icon $mono 'android-icon-monochrome.png'

# Web favicon.
$favicon = New-Square 48 '#FFFFFF'
Add-CentredMark $favicon $logo 0.86
Save-Icon $favicon 'favicon.png'

# On-canvas logo for dark surfaces: the same artwork with its RGB inverted so
# the mark stays legible on a near-black canvas. The alpha channel is kept
# exactly as drawn, so the silhouette never changes.
$source = [System.Drawing.Image]::FromFile($mark)
$invert = New-Object System.Drawing.Imaging.ColorMatrix
$invert.Matrix00 = -1
$invert.Matrix11 = -1
$invert.Matrix22 = -1
$invert.Matrix33 = 1
$invert.Matrix40 = 1
$invert.Matrix41 = 1
$invert.Matrix42 = 1
$attributes = New-Object System.Drawing.Imaging.ImageAttributes
$attributes.SetColorMatrix($invert)
$canvas = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$rect = New-Object System.Drawing.Rectangle(0, 0, $source.Width, $source.Height)
$graphics.DrawImage($source, $rect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
$graphics.Dispose()
$source.Dispose()
$canvas.Save((Join-Path $root 'logo-dark.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose()
Write-Output 'wrote logo-dark.png'
