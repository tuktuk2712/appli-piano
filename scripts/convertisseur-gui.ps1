# Convertisseur de partitions — interface graphique.
# Glisse des PDF dans la fenêtre (ou clique « Choisir des PDF... ») : ils sont convertis
# en .mxl via Audiveris et déposés dans OneDrive\Partitions Piano (sync auto téléphone).
param([string[]]$Fichiers)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$root = Split-Path $MyInvocation.MyCommand.Path -Parent
$converter = Join-Path $root 'convert-pdf.ps1'

# ---------- Fenêtre ----------
$form = New-Object System.Windows.Forms.Form
$form.Text = '🎼 Convertisseur de partitions — Piano Studio'
$form.Size = New-Object System.Drawing.Size(620, 480)
$form.StartPosition = 'CenterScreen'
$form.BackColor = [System.Drawing.Color]::FromArgb(14, 17, 22)
$form.ForeColor = [System.Drawing.Color]::FromArgb(232, 236, 242)
$form.Font = New-Object System.Drawing.Font('Segoe UI', 10)
$form.AllowDrop = $true

$title = New-Object System.Windows.Forms.Label
$title.Text = "Dépose tes partitions PDF ici`n(ou clique sur le bouton)"
$title.TextAlign = 'MiddleCenter'
$title.Dock = 'Top'
$title.Height = 70
$title.Font = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Bold)

$btn = New-Object System.Windows.Forms.Button
$btn.Text = '📂  Choisir des PDF...'
$btn.Dock = 'Top'
$btn.Height = 44
$btn.FlatStyle = 'Flat'
$btn.BackColor = [System.Drawing.Color]::FromArgb(108, 140, 255)
$btn.ForeColor = [System.Drawing.Color]::White
$btn.Font = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)

$status = New-Object System.Windows.Forms.Label
$status.Text = 'Prêt.'
$status.Dock = 'Top'
$status.Height = 34
$status.TextAlign = 'MiddleLeft'
$status.Padding = New-Object System.Windows.Forms.Padding(10, 0, 0, 0)
$status.ForeColor = [System.Drawing.Color]::FromArgb(255, 207, 92)

$log = New-Object System.Windows.Forms.TextBox
$log.Multiline = $true
$log.ReadOnly = $true
$log.ScrollBars = 'Vertical'
$log.Dock = 'Fill'
$log.BackColor = [System.Drawing.Color]::FromArgb(22, 27, 35)
$log.ForeColor = [System.Drawing.Color]::FromArgb(180, 200, 220)
$log.Font = New-Object System.Drawing.Font('Consolas', 9)

$form.Controls.Add($log)
$form.Controls.Add($status)
$form.Controls.Add($btn)
$form.Controls.Add($title)

function Add-Log([string]$msg) {
  $log.AppendText("$msg`r`n")
}

# ---------- File d'attente + job en arrière-plan (la fenêtre ne gèle jamais) ----------
$queue = New-Object System.Collections.Queue
$script:job = $null
$script:busy = $false

function Start-NextConversion {
  if ($script:busy -or $queue.Count -eq 0) { return }
  $pdf = $queue.Dequeue()
  $script:busy = $true
  $status.Text = "⏳ Conversion : $([System.IO.Path]::GetFileName($pdf))  (1 à 3 min par page...)"
  Add-Log ">>> $pdf"
  $script:job = Start-Job -ScriptBlock {
    param($conv, $file)
    & $conv $file *>&1 | ForEach-Object { "$_" }
  } -ArgumentList $converter, $pdf
}

function Add-Pdfs([string[]]$paths) {
  $n = 0
  foreach ($p in $paths) {
    if ($p -and (Test-Path $p) -and $p.ToLower().EndsWith('.pdf')) {
      $queue.Enqueue((Resolve-Path $p).Path)
      $n++
    }
  }
  if ($n -gt 0) {
    Add-Log "$n PDF ajouté(s) à la file."
    Start-NextConversion
  } else {
    $status.Text = '⚠️ Aucun fichier PDF valide.'
  }
}

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 700
$timer.Add_Tick({
  if (-not $script:job) { return }
  Receive-Job $script:job | ForEach-Object { Add-Log "  $_" }
  if ($script:job.State -in 'Completed', 'Failed', 'Stopped') {
    Receive-Job $script:job | ForEach-Object { Add-Log "  $_" }
    Remove-Job $script:job -Force
    $script:job = $null
    $script:busy = $false
    if ($queue.Count -gt 0) {
      Start-NextConversion
    } else {
      $status.Text = "✅ Terminé ! Fichiers dans OneDrive → « Partitions Piano » (sync vers ton téléphone)."
      Add-Log ''
      Add-Log '=== Sur ton téléphone : app OneDrive -> Partitions Piano -> "Envoyer une copie" -> Piano Studio ==='
    }
  }
})
$timer.Start()

# ---------- Événements ----------
$btn.Add_Click({
  $dlg = New-Object System.Windows.Forms.OpenFileDialog
  $dlg.Filter = 'Partitions PDF (*.pdf)|*.pdf'
  $dlg.Multiselect = $true
  $dlg.Title = 'Choisis tes partitions PDF'
  if ($dlg.ShowDialog() -eq 'OK') { Add-Pdfs $dlg.FileNames }
})

$form.Add_DragEnter({
  if ($_.Data.GetDataPresent([System.Windows.Forms.DataFormats]::FileDrop)) {
    $_.Effect = [System.Windows.Forms.DragDropEffects]::Copy
  }
})
$form.Add_DragDrop({
  Add-Pdfs ($_.Data.GetData([System.Windows.Forms.DataFormats]::FileDrop))
})

$form.Add_FormClosing({
  $timer.Stop()
  if ($script:job) { Stop-Job $script:job -ErrorAction SilentlyContinue; Remove-Job $script:job -Force -ErrorAction SilentlyContinue }
})

Add-Log 'Convertisseur prêt. Moteur : Audiveris (reconnaissance optique de partitions).'
Add-Log 'Astuce : cherche toujours le fichier MusicXML/MIDI en premier (100 % fiable) —'
Add-Log 'le PDF converti peut contenir quelques erreurs selon la qualité du document.'
Add-Log ''

# Fichiers passés en argument (glissés sur le raccourci)
if ($Fichiers) { Add-Pdfs $Fichiers }

[void]$form.ShowDialog()
