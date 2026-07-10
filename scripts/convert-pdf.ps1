# Convertit des partitions PDF en MusicXML (.mxl) importables dans Piano Studio.
# Moteur : Audiveris (reconnaissance optique de partitions, open source).
#
# Usage :
#   .\scripts\convert-pdf.ps1 chemin\vers\partition.pdf
#   .\scripts\convert-pdf.ps1 dossier\plein\de\pdf\
#
# Résultat : un fichier .mxl par PDF dans le dossier "converties\" à côté du PDF,
# à importer ensuite dans l'app via Morceaux -> Importer un fichier.

param(
  [Parameter(Mandatory = $true, HelpMessage = "PDF ou dossier de PDF à convertir")]
  [string]$Chemin
)

$ErrorActionPreference = 'Stop'

function Find-Audiveris {
  $candidates = @(
    "$env:ProgramFiles\Audiveris\Audiveris.exe",
    "$env:ProgramFiles\Audiveris\bin\Audiveris.bat",
    "$env:LOCALAPPDATA\Programs\Audiveris\Audiveris.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  $cmd = Get-Command audiveris -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

$audiveris = Find-Audiveris
if (-not $audiveris) {
  Write-Host "Audiveris n'est pas installé. Installation via winget..." -ForegroundColor Yellow
  winget install --id audiveris.org.Audiveris --accept-source-agreements --accept-package-agreements --silent
  $audiveris = Find-Audiveris
  if (-not $audiveris) {
    Write-Host "Installation impossible. Télécharge Audiveris ici : https://audiveris.github.io/audiveris/" -ForegroundColor Red
    exit 1
  }
}

# Liste des PDF à traiter
$item = Get-Item $Chemin
$pdfs = if ($item.PSIsContainer) { Get-ChildItem $item.FullName -Filter *.pdf } else { @($item) }
if ($pdfs.Count -eq 0) { Write-Host "Aucun PDF trouvé dans $Chemin" -ForegroundColor Red; exit 1 }

$outDir = Join-Path (Split-Path $pdfs[0].FullName -Parent) 'converties'
New-Item -ItemType Directory -Force $outDir | Out-Null

function Convert-One([System.IO.FileInfo]$pdf, [string]$outDir, [string]$audiveris) {
  & $audiveris -batch -export -output $outDir $pdf.FullName | Out-Null
  $mxl = Join-Path $outDir ($pdf.BaseName + '.mxl')
  if (-not (Test-Path $mxl)) {
    # Audiveris peut créer un sous-dossier par partition selon la version
    $found = Get-ChildItem $outDir -Recurse -Filter ($pdf.BaseName + '*.mxl') -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $mxl = $found.FullName }
  }
  if (Test-Path $mxl) { return $mxl }
  return $null
}

$ok = 0
foreach ($pdf in $pdfs) {
  Write-Host "Conversion de $($pdf.Name)... (1 à 3 min par page)" -ForegroundColor Cyan
  $mxl = Convert-One $pdf $outDir $audiveris
  if (-not $mxl) {
    # le tout premier lancement d'Audiveris peut échouer pendant son initialisation : on retente une fois
    Write-Host "  Nouvelle tentative..." -ForegroundColor Yellow
    $mxl = Convert-One $pdf $outDir $audiveris
  }
  if ($mxl) {
    Write-Host "  OK -> $mxl" -ForegroundColor Green
    $ok++
  } else {
    Write-Host "  ECHEC pour $($pdf.Name) : partition illisible ou scan de mauvaise qualité." -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "$ok/$($pdfs.Count) PDF convertis dans : $outDir" -ForegroundColor Green
Write-Host "Importe les .mxl dans Piano Studio : Morceaux -> Importer un fichier."
Write-Host "(Envoie-les d'abord sur ton téléphone : Google Drive, mail, câble...)"
