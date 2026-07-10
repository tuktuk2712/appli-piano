# 🎹 Piano Studio

Application web personnelle d'apprentissage du piano, pensée pour un **Yamaha P-145** et un
téléphone **Android**. Hébergée gratuitement sur GitHub Pages, installable comme une vraie
application (PWA), utilisable hors-ligne.

## Fonctionnalités

- **Notes qui tombent** (style Synthesia) : notes colorées par main (🔵 droite, 🟢 gauche),
  clavier virtuel aligné, ligne d'impact.
- **Partitions** : vraie notation musicale (OpenSheetMusicDisplay) avec curseur synchronisé.
- **L'app t'écoute** :
  - 🎤 **Micro** : pose le téléphone sur le piano, l'app vérifie que tu joues les bonnes notes
    (détection ciblée fondamentale + harmoniques, calibrée sur le bruit ambiant) ;
  - 🎹 **MIDI** : branche le piano en USB pour une précision parfaite (voir plus bas) ;
  - 👆 **Toucher** : joue directement sur le clavier virtuel (vrai son de piano échantillonné).
- **Outils de travail** : tempo 50–150 %, mode attente (la lecture attend ta note), boucle A-B,
  mains séparées, métronome, score et étoiles ⭐⭐⭐, progression sauvegardée.
- **Bibliothèque** : ~28 morceaux du domaine public en 3 niveaux + **import** de fichiers
  `.mid`, `.musicxml`, `.mxl` (des milliers disponibles sur musescore.com).
- **Leçons débutant** : le clavier, les noms de notes, clé de sol, clé de fa, le rythme —
  avec quiz interactifs.

## Installation sur Android

1. Ouvre l'URL du site dans **Chrome** sur ton téléphone.
2. Menu ⋮ → **« Ajouter à l'écran d'accueil »** (ou « Installer l'application »).
3. Lance « Piano Studio » depuis l'écran d'accueil : plein écran, fonctionne hors-ligne.

## Connecter le Yamaha P-145

**Au micro (aucun matériel)** : dans un morceau, appuie sur 🎤. Laisse 1,5 s de silence pour la
calibration, puis joue. Astuce : pose le téléphone sur le piano, volume du piano à un niveau normal.

**En USB MIDI (recommandé à terme, ~10 €)** : câble **USB-B vers USB-C** (le P-145 a une prise
carrée « TO HOST » à l'arrière). Branche, autorise le MIDI dans Chrome : bandeau
« 🎹 MIDI connecté » — détection parfaite de chaque note, y compris les accords.

## Convertir une partition PDF

Un PDF est une image : il faut le convertir en MusicXML par reconnaissance optique (OMR).
Sur ton PC, dans le dossier du projet :

```powershell
.\scripts\convert-pdf.ps1 chemin\vers\partition.pdf     # un fichier
.\scripts\convert-pdf.ps1 chemin\vers\dossier\          # tous les PDF d'un dossier
```

Le script installe automatiquement [Audiveris](https://audiveris.github.io/audiveris/) (open
source, le meilleur du domaine) et produit un `.mxl` dans le sous-dossier `converties\`.
Envoie-le sur ton téléphone (Drive, mail…) et importe-le dans l'app : **Morceaux → Importer**.

> Astuce : avant de convertir, cherche le morceau sur [musescore.com](https://musescore.com) —
> il existe souvent déjà en MusicXML, prêt à importer. La qualité OMR dépend du scan : les PDF
> « natifs » (exportés d'un logiciel) se convertissent très bien, les scans flous beaucoup moins.

## Développement

```bash
npm install
npm run dev        # serveur local
npm test           # tests (Vitest)
npm run build      # build de production (tsc + vite)
node scripts/generate-library.mjs   # régénérer les MusicXML depuis scripts/songs/*.mjs
```

Déploiement automatique sur GitHub Pages à chaque push sur `main` (`.github/workflows/deploy.yml`).

## Crédits

- Sons de piano : soundfont **FluidR3** (`gleitz/midi-js-soundfonts`), licence libre.
- Rendu de partitions : [OpenSheetMusicDisplay](https://opensheetmusicdisplay.org/).
- Morceaux : arrangements maison d'œuvres du **domaine public**.

Projet personnel — généré avec [Claude Code](https://claude.com/claude-code).
