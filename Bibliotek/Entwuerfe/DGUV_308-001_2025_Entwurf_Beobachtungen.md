# Beobachtungen zum DGUV Grundsatz 308-001 (2025) – Kommentierungsentwurf, Stand 15.06.2026

Quelle: `DGUV_Grundsatz_308-001_2025_Entwurf_2026-06-15.docx` (öffentlicher Kommentierungsentwurf,
noch nicht final/rechtskräftig). Analyse erstellt am 2026-07-12 als Vormerkung für die
Überarbeitung von `praxispruefung_stufe1.html` / `praxispruefung_stufe2.html`, sobald eine
finale Fassung erscheint (laut Ankündigung ca. 2027).

## 1. Strukturelle Änderung: kein „Stufe 1"/„Stufe 2"-Modell mehr

Der Entwurf gliedert nicht mehr in Stufe 1/Stufe 2, sondern in 9 gleichrangige
„Qualifizierungsmodule" je Gerätetyp (Anhang B):

- Gabelstapler (Gegengewichtstapler)
- **LKW-Mitnahmestapler** — neu, aktuell nicht auf der Seite vorhanden
- Schubmaststapler
- **Drei-Seitenstapler** (umfasst laut Text „Schmalgangstapler, Regalstapler" als Unterbegriffe)
  — unser eigenständiges Stufe-2-Gerät „Schmalgangstapler" wäre in der neuen Struktur nur noch
  ein Unterfall dieses Moduls, kein eigenes Modul mehr
- Vertikal-Kommissionierer
- Kleinteile-Kommissionierer (LCEP)
- Horizontal-Kommissionierer
- Niederhub-MFFZ (kraftbetrieben/deichselgeführt, 2 Varianten)
- Hochhub-MFFZ (kraftbetrieben/deichselgeführt)

**Offene Klärungsfrage für später:** Unser jetziges Stufe-2-Gerät „Kommissionierer" müsste
laut Entwurf einem von drei getrennten Modulen zugeordnet werden (Vertikal-/Kleinteile-/
Horizontal-Kommissionierer) — muss fachlich geklärt werden, welcher Gerätetyp tatsächlich
geschult/geprüft wird.

## 2. Mögliche neue Prüfpunkte („Tägliche Einsatzprüfung")

Bei Schubmaststapler, Drei-Seitenstapler und Vertikal-Kommissionierer taucht wiederholt
(6× im Dokument) ein Punkt auf, der aktuell in **keiner** unserer Checklisten (`PP_*` in
`GERAETE` in `praxispruefung_stufe1.html`/`_stufe2.html`) vorkommt:

- **Rückhaltesystem** (Fahrer-Rückhalteeinrichtung/Gurt) — systematisch als eigener Prüfpunkt gelistet

Weitere Punkte, die im Entwurf granularer sind als bei uns:
- „Gabelzinken" separat (Verformung, Risse, Verschleiß, Aufhängung, Sicherung) — bei uns nur
  pauschal „Lastaufnahmemittel"
- „Hubketten" (Spannung, Schmierung) — fehlt aktuell komplett
- „Lastschutzgitter" — fehlt aktuell
- „Arretiervorrichtung" (bei Kommissionierer-Modulen) — fehlt aktuell

Bestätigt (kommen bei uns schon vor und tauchen auch im Entwurf sinngemäß auf): Bremsen,
Hupe, Warnleuchten/Beleuchtung, Prüfplakette, Anbaugeräte-Funktion, Hubmast/Neigen.

## 3. Einschränkungen dieser Analyse

- Die extrahierten Inhalte sind **Lehrinhalt/Curriculum-Text** (Anhang B), nicht die finale
  Abnahme-Checkliste. Die eigentlichen „Prüfungsparcours" (Anhang C, je Gerät) liegen im
  Dokument nur als **Grafiken/Diagramme** vor und wurden hier nicht ausgewertet.
- Der Entwurf selbst enthält an vielen Stellen noch Platzhalter („ca. xx LE",
  „Übungszeit xx Minuten") — Dauer-/Mengenvorgaben sind auch im Entwurf noch nicht final.
- Es handelt sich um einen Kommentierungsentwurf, der sich bis zur finalen Fassung noch
  ändern kann.

## Empfehlung für die spätere Umsetzung

Keine Codeänderungen vor Erscheinen der finalen Fassung. Beim Update dann:
1. Diese Datei und `DGUV_Grundsatz_308-001_2025_Entwurf_2026-06-15.docx` gegen die finale
   Fassung abgleichen (Änderungs-Scout-Vorgehen).
2. Klären, ob „Schmalgangstapler" als eigenes Gerät bestehen bleibt oder ins Modul
   „Drei-Seitenstapler" überführt wird.
3. Klären, welchem der drei Kommissionierer-Module unser aktuelles Gerät entspricht.
4. Prüfen, ob „Rückhaltesystem" als neuer Checklisten-Punkt in `GERAETE.*.check1`
   ergänzt werden muss.
