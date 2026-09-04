# ProDrive Akademie Niederbayern — Website & Automatisierung

Statische Multi-Page-HTML/CSS/Vanilla-JS-Website auf GitHub Pages (Custom Domain
`prodrive-akademie.de`), betrieben von Daniel Eckmeier (Einzelunternehmen,
Kleinunternehmer §19 UStG). Backend läuft über Power Automate + SharePoint
(keine direkte API-Anbindung im Code, nur Webhook-URLs).

## Geschäftsdaten (Referenz, nicht in Frontend hardcoden ohne Grund)

- Firma: ProDrive Akademie Niederbayern, Inhaber Daniel Eckmeier
- Adresse: Am Schwimmbad 12, 94436 Simbach (bei Landau a.d. Isar, Lkr.
  Dingolfing-Landau — **nicht** Simbach am Inn)
- E-Mail: danieleckmeier@prodrive-akademie.de · Tel. 0160 96877039
- Bank: Kontist, IBAN DE42 1101 0101 5973 2498 43, BIC SOBKDEB2XXX
- Qualifikationen: BGHW-Seminar "Ausbilder/in von Gabelstaplerfahrern –
  Grundlagen" (2016, Illertissen); "Ausbilder für Ladungssicherung nach
  VDI 2700" bei Stapler-Schmidt (Fachkunde 04.02.2024)

## Harte Regel: Power-Automate-Flows

**Niemals Flow-Änderungen vorschlagen oder voraussetzen, ohne explizit gefragt
zu werden.** Website-Änderungen sollen nach Möglichkeit rein frontend-seitig
(HTML/CSS/JS) funktionieren, ohne dass Daniel etwas an den Flows anpassen
muss. Ich habe keinen direkten API-Zugriff auf Power Automate — Diagnose und
Änderungen dort laufen ausschließlich über Screenshots, die Daniel schickt.

## Git-Workflow

Jeder Commit wird **doppelt gepusht**:
```
git push origin claude/github-app-b8mqkk:main
git push origin claude/github-app-b8mqkk
```
Commits/Pushes nur wenn explizit gewünscht (Stop-Hook erinnert automatisch an
uncommitted changes, das ist kein Auftrag zum eigenmächtigen Commit-Text-Wählen
ohne Kontext).

## SharePoint-Struktur (Site: "Ausbildung Zentrale")

`https://ausbildung1986.sharepoint.com/sites/AusbildungZentrale`

Zentrale Teilnehmerliste: **`Staplerprufung_Master`** — enthält u.a.
`Registrierungsnummer`, `Name_Teilnehmer`, `Vorname_Teilnehmer`,
`Email_Teilnehmer`, `Geburtsdatum`, `Geburtsort`, sowie Modul-Status-Felder
(`Stufe1_gebucht`, `Stufe2_gebucht`, `LaSi_gebucht`, `Training_gebucht`,
`Nachweis_Stufe1_vorhanden`, `ELearning_Zugang`, `Pruefung_Stufe1_Freigegeben`,
`pruefung_lasi_freigegeben`, `Punkte_Theorie`, `Status_Theorie`, `Pruefer`).

Weitere Listen pro Modul (z.B. `Staplerprufung_Stufe2`,
`Ladungssicherung_Master`) haben **eigene, nicht garantiert identische
Spaltennamen** — vor jeder Filterabfrage im Flow-Editor die tatsächliche
Spaltenbezeichnung prüfen (Screenshot anfordern), nicht raten.

**Falle:** Eine Spalte, die in der UI "Registrierungsnummer" heißt, kann
intern trotzdem das SharePoint-Standardfeld **`Title`** sein (abhängig davon,
ob die Spalte umbenannt oder neu angelegt wurde). OData-Filter brauchen den
internen Namen — im Zweifel über den Dynamische-Inhalte-Picker im
Flow-Editor bauen lassen, nicht den Anzeigenamen frei eintippen.

Zertifikat-Erstellungs-Flows (pro Kursvariante, z.B. `Zertifikaterstellung`
für Stufe 1, `Zert_S2_Schub`/`Zert_S2_Komm`/`Zert_S2_Schmal` für Stufe 2 je
Gerät, `Theorieprüfung_Ladungssicherung_Auswertung` für LaSi) sind
**strukturell nicht identisch** — manche haben eine `For each`-Schleife nach
"Elemente abrufen", manche nicht, manche haben gar keinen "Elemente
abrufen"-Schritt. Vor jeder Änderung die tatsächliche Struktur per Screenshot
prüfen, nicht von einem anderen Flow übernehmen.

## Design-Tokens (index.html, für Konsistenz auf anderen Seiten)

```
--blue:#1a4fa8 --blue-l:#2e75cc --blue-d:#0d2d80 --blue-xl:#e8f0fb
--navy:#16243f --ink:#1a2330 --muted:#5a6a7a --line:#e3e8f0
--safety:#f07920 (Orange-Akzent) --bg:#f7f9fb
```

## Testing

- JS-Syntax-Check: Inline-`<script>`-Blöcke (ohne `src=`) per Regex
  extrahieren und mit `new Function(code)` parsen.
- Visuelle Prüfung: Playwright + Chromium
  (`executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`,
  `NODE_PATH=/opt/node22/lib/node_modules`).

## Sonstiges

- Nie Zertifikats-/Qualifikationsdetails erfinden — immer nach den echten
  Angaben (Aussteller, Datum, genauer Titel) fragen, bevor sie auf der
  Website erscheinen.
- Registrierungsnummer-Format: `YYYY-NNN` (z.B. `2026-001`).

## Bestehender Rechnungs-/E-Mail-Mechanismus (Flow "Anmeldung HP")

Der Haupt-Anmeldeflow ("Anmeldung HP", Owner Daniel Eckmeier, verbunden mit
Office 365 Outlook + SharePoint + OneDrive) enthält bereits die komplette
Rechnungs- und Versandlogik für Stufe1/Stufe2/LaSi-Buchungen. Grobe Struktur
(Stand 04.09.2026, per Screenshot erfasst, nicht vollständig durchgebaut):

- Trigger → viele `Variable initialisieren`-Schritte (u.a.
  `VarLeistungenHTMLGruppiert`, `VarNeueRechnungsnummer`,
  `VarLeistungenHTML`, `VarGesamtbetrag`, `VarPositionenArray`)
- Bedingung "Ist Sammelanmeldung" (Wahr/Falsch) — Sammelanmeldungen (mehrere
  Teilnehmer/Kurse in einer Buchung) laufen über einen eigenen Zweig mit
  `VarSammelID`, pro Kurstyp eigene Bedingungen (`Ist Stufe 2 Sammel`, `Ist
  Ladungssicherung Sammel`), `For each Teilnehmer` mit Existenzprüfung
  ("Teilnehmer existiert bereits" → Update statt Neuanlage)
- Rechnungsnummer-Vergabe: `Letzte Rechnungsnummer Sammel` (Elemente
  abrufen, wohl sortiert) → Bedingung `Rechnungsnummer vorhanden Sammel 2`
  (Wahr/Falsch) → jeweils eigene `Variable festlegen`
- Rechnungserstellung: `For each Positionen Sammel` (Element aktualisieren
  + Array aufbauen) → `For each Gruppierung Sammel` (Array filtern) →
  `Logo laden Sammel` → **Stripe-Integration**: `Stripe Preis erstellen` →
  `Stripe Zahlungslink erstellen` → `QR Code laden` → `Rechnung HTML
  gesammelt Sammel` (HTML-Vorlage zusammenbauen) → `Datei erstellen Sammel`
  → `Datei konvertieren Sammel` (vermutlich HTML→PDF) → `Datei erstellen
  SharePoint Sammel` (Ablage der Rechnung als Datei) → `E-Mail senden
  Sammel` (Versand)
- Danach weitere Bedingungen für Einzelbuchungen (`Bedingung 1`, `Hat
  Stufe1 Nachweis`, `Schubmaststapler`, etc.) — nicht im Detail erfasst.

**Für die Jährliche Unterweisung (Zahlungen-Liste)** wurde bewusst
entschieden, **nicht** diese komplette Stripe+PDF+SharePoint-Pipeline
nachzubauen, sondern zunächst nur eine einfache Zahlungen-Zeile (Firma,
Kurs, Betrag, Rechnungsnummer) anzulegen — die volle Rechnungs-PDF- und
E-Mail-Automatisierung ist als eigener, späterer Ausbauschritt vorgesehen.

## Jährliche Unterweisung — Architektur (in Arbeit, Stand 04.09.2026)

Neues, von `Staplerprufung_Master` komplett unabhängiges Feature für
unternehmensweite jährliche Sicherheitsunterweisungen (Buchung + digitale
Unterschriftenliste). Persistente Unternehmens_ID (`U-001`, `U-002`, ...)
pro Firma, bleibt über mehrere Jahre/Buchungen gleich.

**Neue SharePoint-Listen** (alle mit Title-Spalte umbenannt zu
`Unternehmens_ID`, dadurch **intern weiterhin `Title`** — Title-Falle
beachten):
- `Unterweisung_Unternehmen` (Site "Ausbildung Zentrale"): `Unternehmens_ID`
  (=Title), `Firma`, `Ansprechpartner`, `Email_AP`, `Telefon_AP`,
  `Unternehmen_Adresse`
- `Unterweisung_Buchungen` (Site **"ProDrive Verwaltung"**, nicht Ausbildung
  Zentrale!): `Unternehmens_ID` (=Title), `Firma`, `Datum`, `Jahr`, `Status`
  (Choice: `Offen`/`Abgeschlossen`), `Rechnungsnummer`
- `Unterweisung_Teilnehmer` (Site "Ausbildung Zentrale"): `Unternehmens_ID`
  (=Title), `Datum`, `Nachname`, `Vorname`, `Geburtsdatum`, `Status` (Choice:
  `Offen`/`Unterschrieben`/`Entschuldigt`), `Unterschrift` (mehrzeiliger
  Text, Base64-PNG)
- `Zahlungen` (Site "ProDrive Verwaltung", bestehende Liste) erweitert um
  Kurs-Option `"Jährliche Unterweisung Flurförderzeuge"` — Spalte
  `Firmenname` existierte dort bereits.

**Wichtiger Connector-Fallstrick:** Choice-Spalten kommen beim SharePoint
"Elemente abrufen" manchmal als Objekt `{Value:"Offen", Id:0, ...}` zurück,
nicht als reiner String — beim Auslesen daher immer
`item()?['Spalte']?['Value']` verwenden (ggf. mit `coalesce(...)` gegen
reine String-Fälle absichern), nie `item()?['Spalte']` direkt in
`toLower()`/String-Funktionen stecken.

**`select()`-Lambda-Ausdrücke funktionieren in diesem Flow-Typ nicht
zuverlässig** (Parserfehler) — für Array-Transformationen stattdessen die
Datenvorgänge-Aktion **"Auswählen" (Select)** verwenden (grafisches
Mapping), für "höchsten Wert finden"-Logik lieber `For each` + Bedingung +
Variable statt `select()`/`max()`-Lambda-Kombination.

**Flows (alle neu, unabhängig vom bestehenden `ANMELDUNG_URL`-Flow):**
- `Unterweisung_Buchung_Anlegen` — nimmt Buchung von `anmeldung.html`
  entgegen, vergibt/findet `Unternehmens_ID`, legt Buchung + Teilnehmer an.
  Fertig & getestet.
- `Unterweisung_Firmenverzeichnis` — liefert `{unternehmen:[{unternehmens_id,
  firma}]}` für die Firmensuche im Trainer-Tool. Fertig & getestet.
- `Unterweisung_Liste_Abrufen` (in der UI als "UNTERWEISUNG_ABRUFEN_URL"
  benannt) — liefert zu einer `Unternehmens_ID` Firma + Teilnehmerliste.
  Fertig & getestet.
- `UNTERWEISUNG_SPEICHERN_URL` — schreibt Unterschrift/Status je Teilnehmer
  zurück; Grundfunktion (Teilnehmer aktualisieren) fertig & getestet. Die
  Abschluss-Logik (Rechnung anlegen bei 0 offenen Teilnehmern, E-Mail-Versand)
  ist **in Arbeit, noch nicht fertig**.

**Preislogik Jährliche Unterweisung** (bestätigt, netto/brutto noch klären
falls relevant): pro Teilnehmer gestaffelt — 1–3 TN: 89€, 4–6 TN: 69€, 7+ TN:
55€ (keine weitere Stufe ab 9+, bleibt bei 55€) — plus Mindestpauschale
300€ pro Termin, es gilt der höhere der beiden Beträge:
`Betrag = max(300, Teilnehmerzahl × Preis/TN)`.

**Offene Entscheidung:** Rechnung bei Abschluss der Unterschriftenliste
(nicht bei Buchung) — Rechnungsnummer-Vergabe soll die bestehende Logik aus
"Anmeldung HP" (`Letzte Rechnungsnummer` + Fallback-Bedingung) wiederverwenden,
noch nicht implementiert. Zwei getrennte E-Mails (eine mit Rechnung, eine mit
unterschriebener Liste) sind gewünscht, aber die PDF-/HTML-Erstellung dafür
ist noch nicht gebaut.
