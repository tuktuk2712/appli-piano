// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseMusicXml } from '../src/core/musicxml-parser';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Test</work-title></work>
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <direction><sound tempo="90"/></direction>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><staff>1</staff></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>2</duration><staff>1</staff><tie type="start"/></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>8</duration><staff>2</staff></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>8</duration><staff>2</staff></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>2</duration><staff>1</staff><tie type="stop"/></note>
      <note><rest/><duration>2</duration><staff>1</staff></note>
      <note><pitch><step>F</step><alter>1</alter><octave>5</octave></pitch><duration>4</duration><staff>1</staff></note>
      <backup><duration>8</duration></backup>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>8</duration><staff>2</staff></note>
    </measure>
  </part>
</score-partwise>`;

describe('parseMusicXml', () => {
  const song = parseMusicXml(XML, { id: 'fix', level: 1 });
  const q = 60 / 90; // durée d'une noire

  it('métadonnées', () => {
    expect(song.title).toBe('Test');
    expect(song.bpm).toBe(90);
    expect(song.timeSignature).toEqual([4, 4]);
    expect(song.musicXml).toContain('score-partwise');
  });

  it('nombre de notes (accord compté, liaison fusionnée, silence ignoré)', () => {
    expect(song.notes).toHaveLength(7);
  });

  it('mains par portée', () => {
    expect(song.notes.filter((n) => n.hand === 'left')).toHaveLength(3);
    expect(song.notes.filter((n) => n.hand === 'right')).toHaveLength(4);
  });

  it('temps et durées corrects', () => {
    const c5 = song.notes.find((n) => n.midi === 72)!;
    expect(c5.time).toBeCloseTo(0);
    expect(c5.duration).toBeCloseTo(2 * q);
    const e5 = song.notes.find((n) => n.midi === 76)!;
    expect(e5.time).toBeCloseTo(2 * q);
  });

  it('accord : deux notes au même instant', () => {
    const left = song.notes.filter((n) => n.hand === 'left' && n.time < 0.01);
    expect(left.map((n) => n.midi).sort()).toEqual([48, 55]);
  });

  it('liaison fusionnée sur la barre de mesure', () => {
    const g5 = song.notes.filter((n) => n.midi === 79);
    expect(g5).toHaveLength(1);
    expect(g5[0].duration).toBeCloseTo(2 * q);
  });

  it('altération (fa dièse) et silence décalant le temps', () => {
    const fs5 = song.notes.find((n) => n.midi === 78)!;
    expect(fs5.time).toBeCloseTo(6 * q);
  });

  it('mesures renseignées', () => {
    expect(song.notes.find((n) => n.midi === 78)!.measure).toBe(2);
  });

  it('rejette un XML sans notes', () => {
    expect(() => parseMusicXml('<score-partwise></score-partwise>')).toThrow();
  });

  it('mesure composée <beats>3+2</beats> : signature de repli finie (pas de NaN)', () => {
    const xml = XML.replace('<beats>4</beats>', '<beats>3+2</beats>');
    const song = parseMusicXml(xml);
    expect(Number.isFinite(song.timeSignature[0])).toBe(true);
    expect(song.timeSignature[0]).toBeGreaterThan(0);
  });

  it('un tie-start orphelin n absorbe pas un tie-stop lointain', () => {
    const xml = `<?xml version="1.0"?>
<score-partwise><part-list><score-part id="P1"/></part-list><part id="P1">
  <measure number="1">
    <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><tie type="start"/></note>
    <note><rest/><duration>3</duration></note>
  </measure>
  <measure number="2">
    <note><rest/><duration>3</duration></note>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><tie type="stop"/></note>
  </measure>
</part></score-partwise>`;
    const song = parseMusicXml(xml);
    // non contiguës : deux notes distinctes, pas une fusion de 2 temps
    expect(song.notes).toHaveLength(2);
  });
});
