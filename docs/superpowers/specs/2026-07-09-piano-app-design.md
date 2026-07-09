# Spec — Application d'apprentissage du piano (PWA)

**Date** : 2026-07-09
**Statut** : Validée par l'utilisateur
**Utilisateur cible** : usage personnel, piano Yamaha P-145, téléphone Android, niveaux débutant complet → intermédiaire.

## 1. Objectif

Une application web progressive (PWA) hébergée gratuitement sur GitHub Pages, de qualité comparable aux applications payantes (Simply Piano, Flowkey), permettant :

- d'apprendre des morceaux en mode « notes qui tombent » (style Synthesia) ;
- d'apprendre à lire et jouer des partitions (notation classique) ;
- de recevoir un feedback en temps réel via le **micro du téléphone** (mode principal) ou via **MIDI** (USB/Bluetooth, bonus automatique) ;
- de suivre sa progression et d'apprendre les bases (leçons débutant).

## 2. Contraintes et décisions actées

| Décision | Choix |
|---|---|
| Connexion piano | **Micro du téléphone** en mode principal ; Web MIDI en bonus auto-détecté |
| Affichage | **Les deux** : notes qui tombent + partition classique |
| Contenu | **Bibliothèque intégrée** (libre de droits, 3 niveaux) **+ import** MIDI/MusicXML |
| Niveau | Parcours complet : débutant complet → intermédiaire |
| Hébergement | GitHub Pages, déploiement auto via GitHub Actions |
| Backend | Aucun. Données de progression en localStorage/IndexedDB |

## 3. Stack technique

- **Vite + TypeScript**, sans framework UI lourd (DOM + Canvas), CSS moderne.
- **OpenSheetMusicDisplay (OSMD)** : rendu des partitions MusicXML.
- **@tonejs/midi** : parsing des fichiers MIDI.
- **Canvas 2D** : mode notes qui tombent + clavier virtuel (60 fps sur mobile).
- **Web Audio API** : son de piano échantillonné (samples Salamander/FluidR3 compressés, chargés à la demande) ; analyse micro (AnalyserNode/FFT).
- **Web MIDI API** : détection auto des périphériques MIDI.
- **PWA** : manifest + service worker (vite-plugin-pwa), installable, hors-ligne.
- **Vitest** : tests unitaires de la logique cœur.

## 4. Architecture des modules

```
src/
  core/          — logique pure, testée unitairement
    song.ts        modèle de morceau (notes, mains, mesures, tempo)
    midi-parser.ts   MIDI → Song
    musicxml-parser.ts MusicXML → Song (+ conservation du XML pour OSMD)
    scheduler.ts     horloge de lecture (tempo, boucle, mode attente)
    matcher.ts       appariement notes attendues / notes jouées, scoring
    progress.ts      persistance progression (scores, étoiles, streaks)
  audio/
    sampler.ts       piano échantillonné (Web Audio)
    mic-listener.ts  détection de notes au micro (FFT, fondamentale+harmoniques,
                     vérification des notes attendues, calibration)
  input/
    midi-input.ts    Web MIDI (auto-détection, hot-plug)
    touch-keys.ts    toucher sur le clavier virtuel
  ui/
    keyboard.ts      clavier virtuel canvas (zoomable, plage adaptative)
    falling-notes.ts rendu Synthesia
    sheet-view.ts    intégration OSMD + curseur
    screens/         accueil, bibliothèque, lecture, leçons, réglages
  data/
    library/         morceaux intégrés (MusicXML) + index.json (titre, niveau, mains)
    lessons/         leçons débutant (JSON déclaratif)
```

**Flux principal** : `Song` (modèle unique) → affiché par `falling-notes` OU `sheet-view` → `scheduler` avance la lecture → `matcher` compare les notes attendues aux événements de `mic-listener`/`midi-input`/`touch-keys` → feedback visuel + score → `progress` sauvegarde.

## 5. Écrans

1. **Accueil/Bibliothèque** : liste des morceaux par niveau, recherche, progression (étoiles), bouton import (file picker → parsing → stockage IndexedDB).
2. **Lecture (learn)** : bascule notes-qui-tombent ⇄ partition ; contrôles : tempo (25–150 %), mode attente (pause jusqu'à la bonne note), boucle A-B, mains (gauche/droite/les deux), métronome ; feedback vert/rouge ; écran de fin avec score et étoiles (1–3).
3. **Piano libre** : clavier plein écran jouable au toucher, son échantillonné, affichage du nom des notes (option).
4. **Leçons** : parcours débutant (noms des notes, clavier, clé de sol/fa, rythme) avec quiz interactifs utilisant micro/toucher.
5. **Réglages** : calibration micro, latence, taille clavier, langue FR.

## 6. Détection micro (cœur technique)

- Principe : **vérification ciblée**, pas transcription. L'app connaît les notes attendues ; elle vérifie via FFT la montée d'énergie sur la fondamentale et les 2–3 premières harmoniques de chaque note attendue, avec détection d'onset (attaque).
- Calibration au premier lancement : l'app demande de jouer quelques notes, mesure le bruit de fond et le profil spectral du piano.
- Tolérance de timing réglable ; anti-faux-positifs (harmoniques partagées entre notes → pondération).
- Si un périphérique MIDI apparaît, bascule automatique avec bandeau « MIDI connecté ✓ ».

## 7. Bibliothèque de départ

~30 morceaux libres de droits en MusicXML, 3 niveaux :
- **Débutant** : Au clair de la lune, Ode à la joie, Frère Jacques, Twinkle Twinkle, exercices 5 doigts…
- **Facile** : Für Elise (A), Canon de Pachelbel simplifié, Menuet en sol, Greensleeves…
- **Intermédiaire** : Gymnopédie n°1, Clair de lune (début), Prélude en do BWV 846…

Générés/arrangés en MusicXML (mélodies domaine public, arrangements maison), stockés dans le repo.

## 8. Gestion des erreurs

- Micro refusé → message clair + modes toucher/MIDI restent utilisables.
- Fichier importé invalide → message d'erreur explicite, pas de crash.
- Pas de Web MIDI (navigateur non compatible) → l'option est simplement masquée.
- Hors-ligne → tout fonctionne sauf premier chargement (service worker).

## 9. Tests

- Unitaires (Vitest) : parsers MIDI/MusicXML, scheduler (tempo/boucle/attente), matcher (scoring, tolérances), progress.
- Détection micro : tests sur signaux synthétiques (sinusoïdes + harmoniques générées).
- Vérification manuelle : Chrome desktop + Chrome Android.

## 10. Critères de succès

- Installable sur Android, plein écran, hors-ligne.
- 60 fps en mode notes qui tombent sur mobile milieu de gamme.
- Détection micro fiable sur notes simples et accords de 2–3 notes joués proprement.
- Import d'un MusicXML de Musescore fonctionne de bout en bout.
- Latence audio clavier tactile < 60 ms.
