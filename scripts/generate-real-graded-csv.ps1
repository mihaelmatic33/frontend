param(
  [string]$OutPath = "C:/Users/imamf/Desktop/frontend/projekt/data/pokemon_graded_cards_40_real_market.csv",
  [int]$Count = 40
)

$ErrorActionPreference = "Stop"

function Get-RarityForAcf {
  param([string]$Rarity)

  $raw = ""
  if ($Rarity) {
    $raw = $Rarity.Trim()
  }
  switch -Regex ($raw) {
    "^Rare$" { "Rare"; break }
    "Very" { "Very rare"; break }
    "Super" { "Super rare"; break }
    "Ultra" { "Ultra rare"; break }
    "Hyper" { "Hyper rare"; break }
    "Illustration" { "Ilustration rare"; break }
    "Special illustration" { "Secret Ilustration rare"; break }
    "Secret" { "Secret rare"; break }
    default { "Rare" }
  }
}

function Get-BasePriceEur {
  param($Pricing)

  if (-not $Pricing) { return $null }

  $cm = $Pricing.cardmarket
  if ($cm) {
    foreach ($k in @("avg", "trend", "avg7", "avg30", "avg1", "low")) {
      if ($cm.PSObject.Properties.Name -contains $k -and $cm.$k -is [double] -and $cm.$k -gt 0) {
        return [double]$cm.$k
      }
      if ($cm.PSObject.Properties.Name -contains $k -and $cm.$k -is [int] -and $cm.$k -gt 0) {
        return [double]$cm.$k
      }
    }
  }

  return $null
}

$gradeMultipliers = @{
  10 = 6.0
  9 = 3.8
  8 = 2.5
  7 = 1.8
  6 = 1.45
  5 = 1.2
  4 = 1.05
}

$companyMultipliers = @{
  "PSA" = 1.15
  "TAG" = 1.08
  "CGC" = 1.00
  "BECKKET" = 1.20
}

$companies = @("PSA", "TAG", "CGC", "BECKKET")
$grades = @(10, 9, 8, 7, 6, 5, 4)

Write-Output "Fetching candidate cards from TCGdex..."
$candidates = Invoke-RestMethod -Uri "https://api.tcgdex.net/v2/en/cards?name=ex" -Method Get

# Prefer modern sets that users commonly search and where prices are usually present.
$preferredPrefixes = @("sv", "swsh", "sm", "xy")
$filtered = $candidates | Where-Object {
  $isPreferred = $false
  foreach ($p in $preferredPrefixes) {
    if ($_.id -like "$p*") {
      $isPreferred = $true
      break
    }
  }

  ($_.name -match "\b(ex|EX)\b") -and $_.image -and $isPreferred
}

# Keep unique IDs and cap how many details we request.
$ids = $filtered | Select-Object -ExpandProperty id -Unique | Select-Object -First 260

$rows = @()
$usedNames = @{}
$i = 0

foreach ($id in $ids) {
  if ($rows.Count -ge $Count) { break }
  $i += 1

  try {
    $card = Invoke-RestMethod -Uri ("https://api.tcgdex.net/v2/en/cards/{0}" -f $id) -Method Get
  }
  catch {
    continue
  }

  if (-not $card -or -not $card.name -or -not $card.image -or -not $card.set -or -not $card.set.name) {
    continue
  }

  $basePrice = Get-BasePriceEur -Pricing $card.pricing
  if (-not $basePrice -or $basePrice -le 0) {
    continue
  }

  $nameKey = "{0}|{1}|{2}" -f $card.name, $card.set.name, $card.localId
  if ($usedNames.ContainsKey($nameKey)) {
    continue
  }

  $company = $companies[($rows.Count % $companies.Count)]
  $grade = $grades[($rows.Count % $grades.Count)]

  $gradeMulti = $gradeMultipliers[$grade]
  $companyMulti = $companyMultipliers[$company]

  $gradedPrice = [Math]::Round(($basePrice * $gradeMulti * $companyMulti), 2)
  if ($gradedPrice -lt 30) {
    $gradedPrice = [Math]::Round(($gradedPrice + 30), 2)
  }

  $acfRarity = Get-RarityForAcf -Rarity $card.rarity

  $rows += [PSCustomObject]@{
    Name = ("{0} ({1}) {2} {3}" -f $card.name, $card.set.name, $company, $grade)
    "Regular price" = $gradedPrice
    categories = "Trading Card Game(TCG)"
    Description = ("Real card: {0} from set {1} (#{2}). Base market EUR {3}; graded value adjusted for {4} {5}." -f $card.name, $card.set.name, $card.localId, ([Math]::Round($basePrice, 2)), $company, $grade)
    Images = ($card.image.TrimEnd('/') + "/high.webp")
    "Meta:rarity" = $acfRarity
    "Meta:grading_company" = $company
    "Meta:grade" = $grade
  }

  $usedNames[$nameKey] = $true
}

if ($rows.Count -lt $Count) {
  throw "Could only prepare $($rows.Count) cards with market pricing. Try again later."
}

$dir = Split-Path -Parent $OutPath
if (-not (Test-Path $dir)) {
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

$rows | Select-Object -First $Count | Export-Csv -Path $OutPath -NoTypeInformation -Encoding UTF8
Write-Output "Created real-market CSV: $OutPath"
Write-Output "Rows: $Count"
