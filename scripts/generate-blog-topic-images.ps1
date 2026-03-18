Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path $PSScriptRoot "..\public\img\blog-topics"
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

$items = @(
  @{ File = "mega-evolution-hype.png"; Bg1 = "#0F172A"; Bg2 = "#1D4ED8"; Accent = "#FCD34D"; Title = @("Pokemon TCG 2026", "Mega Evolution", "Hype"); Subtitle = "sealed products, promo wave and chase cards driving the market again" },
  @{ File = "special-illustration-trend.png"; Bg1 = "#FFF7ED"; Bg2 = "#F97316"; Accent = "#111827"; Title = @("collector watch", "Shiny illustration", "cards"); Subtitle = "art, rarity and an iconic Pokemon - now all in one card" },
  @{ File = "pokemon-go-events.png"; Bg1 = "#052E16"; Bg2 = "#22C55E"; Accent = "#FDE047"; Title = @("Pokemon GO", "events are", "driving hype"); Subtitle = "community days, raids and collabs pushing the whole brand again" },
  @{ File = "grading-2026.png"; Bg1 = "#172554"; Bg2 = "#93C5FD"; Accent = "#EFF6FF"; Title = @("market check", "Grading", "2026"); Subtitle = "PSA 10 upside, risk and real profitability" },
  @{ File = "budget-decks-2026.png"; Bg1 = "#3F6212"; Bg2 = "#A3E635"; Accent = "#F7FEE7"; Title = @("TCG season guide", "budget decks", "2026"); Subtitle = "competitive entry without breaking the budget" },
  @{ File = "starter-products-guide.png"; Bg1 = "#7C2D12"; Bg2 = "#FB923C"; Accent = "#FFF7ED"; Title = @("starter products", "for new", "collectors"); Subtitle = "what makes the most sense for your first step into the hobby" },
  @{ File = "eeveelution-demand.png"; Bg1 = "#4C1D95"; Bg2 = "#A855F7"; Accent = "#E9D5FF"; Title = @("collector focus", "Eeveelution", "demand"); Subtitle = "why these lines always stay among the most sought-after" },
  @{ File = "content-creators-market.png"; Bg1 = "#0F172A"; Bg2 = "#06B6D4"; Accent = "#E0F2FE"; Title = @("social content", "drives", "demand"); Subtitle = "short-form openings, live streams and creator hype reshape the market" },
  @{ File = "sealed-vs-singles.png"; Bg1 = "#1E1B4B"; Bg2 = "#A855F7"; Accent = "#EEF2FF"; Title = @("sealed", "vs", "singles"); Subtitle = "where smarter buyers are directing their budget today" },
  @{ File = "gift-guide-pokemon.png"; Bg1 = "#7F1D1D"; Bg2 = "#F87171"; Accent = "#FEF2F2"; Title = @("Pokemon", "gift guide", "2026"); Subtitle = "ideas for buyers, parents and friends looking for a safe first gift" }
)

function New-Brush($colorText) {
  return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($colorText))
}

function New-RoundedPath($x, $y, $width, $height, $radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRectangle($graphics, $brush, $x, $y, $width, $height, $radius) {
  $path = New-RoundedPath $x $y $width $height $radius
  $graphics.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundedRectangle($graphics, $pen, $x, $y, $width, $height, $radius) {
  $path = New-RoundedPath $x $y $width $height $radius
  $graphics.DrawPath($pen, $path)
  $path.Dispose()
}

foreach ($item in $items) {
  $bitmap = New-Object System.Drawing.Bitmap 1600, 900
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle 0, 0, 1600, 900
  $bg1 = [System.Drawing.ColorTranslator]::FromHtml($item.Bg1)
  $bg2 = [System.Drawing.ColorTranslator]::FromHtml($item.Bg2)
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $bg1, $bg2, 35
  $graphics.FillRectangle($gradient, $rect)

  $panelBrush = New-Brush "#0B1220"
  $panelPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($item.Accent)), 3
  Fill-RoundedRectangle $graphics $panelBrush 92 92 1416 716 36
  Draw-RoundedRectangle $graphics $panelPen 92 92 1416 716 36

  $accentBrush = New-Brush $item.Accent
  $softBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(38, 255, 255, 255))
  $graphics.FillEllipse($softBrush, 1010, 110, 420, 420)
  $graphics.FillEllipse($softBrush, 80, 560, 360, 360)
  $graphics.FillRectangle($accentBrush, 132, 670, 1336, 12)

  $titleSmall = New-Object System.Drawing.Font "Segoe UI", 34, ([System.Drawing.FontStyle]::Bold)
  $titleBig = New-Object System.Drawing.Font "Segoe UI", 88, ([System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font "Segoe UI", 24, ([System.Drawing.FontStyle]::Regular)
  $lightBrush = New-Brush "#F8FAFC"
  $mutedBrush = New-Brush "#D1D5DB"

  $graphics.DrawString($item.Title[0], $titleSmall, $mutedBrush, 150, 190)
  $graphics.DrawString($item.Title[1], $titleBig, $accentBrush, 145, 285)
  $graphics.DrawString($item.Title[2], $titleBig, $accentBrush, 145, 395)

  $subtitleRect = New-Object System.Drawing.RectangleF 150, 555, 1100, 120
  $format = New-Object System.Drawing.StringFormat
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $graphics.DrawString($item.Subtitle, $subtitleFont, $lightBrush, $subtitleRect, $format)

  for ($index = 0; $index -lt 4; $index++) {
    $x = 1040 + ($index * 88)
    $y = 540 - ($index * 48)
    $w = 56
    $h = 170 + ($index * 28)
    $barBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(160, $bg2))
    Fill-RoundedRectangle $graphics $barBrush $x $y $w $h 18
    $barBrush.Dispose()
  }

  $targetPath = Join-Path $outputDir $item.File
  $bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $subtitleFont.Dispose()
  $titleBig.Dispose()
  $titleSmall.Dispose()
  $mutedBrush.Dispose()
  $lightBrush.Dispose()
  $softBrush.Dispose()
  $accentBrush.Dispose()
  $panelPen.Dispose()
  $panelBrush.Dispose()
  $gradient.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Output "Generated blog topic PNG covers."
