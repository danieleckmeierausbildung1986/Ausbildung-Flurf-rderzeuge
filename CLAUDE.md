## Offenes Thema: Hofmann-Honorarrechnung für die eigentliche Schulung fehlt noch (11.10.2026)

Idee von Daniel: Wenn Hofmann z.B. 7 TN für eine Stufe-1-Ausbildung meldet,
reicht es, wenn die 7 TN am Schulungstag selbst da sind — sie können sich
komplett über die neue Vor-Ort-Selbstanmeldung (QR-Code, siehe
"Stempeluhr & Vor-Ort-Teilnehmeranmeldung" unten) selbst eintragen, keine
vorherige Namensliste/Einzelbuchung über `anmeldung.html`/"Anmeldung HP"
nötig.

**Dabei zwei Lücken identifiziert, beide noch ungelöst:**

1. **Es gibt aktuell keine echte Rechnung an Hofmann für die Schulung
   selbst.** Die bestehende Stempeluhr/`Stundenzettel_Monatlich`-Pipeline
   bildet nur Daniels **eigene Arbeitszeit als Dozent** ab (Zeiterfassung,
   PDF-Ablage ohne Rechnungsnummer, kein Versand) — nicht den eigentlichen
   Schulungs-Tagessatz (550–650€ Praxistag, 600–650€ LaSi), der laut
   ursprünglicher Absprache mit Hofmann eigentlich maßgeblich sein sollte.
2. **Keine Verknüpfung zwischen Selbstanmeldung und Firma.** Die
   Teilnehmer-Selbstanmeldung (Flow `Teilnehmer_Selbstanmeldung`) erfasst
   aktuell keine Firmenzugehörigkeit — es gibt also keine Möglichkeit,
   hinterher eine TN-Liste "alle Hofmann-Teilnehmer vom Datum X" für einen
   Rechnungsnachweis zu ziehen.

**Preislogik für die Schulung selbst noch nicht entschieden** (gefragt:
fester Tagessatz unabhängig von TN-Zahl vs. Pro-Teilnehmer-Abrechnung wie
bei Normalbuchungen über "Anmeldung HP") — **muss erst mit Hofmann
geklärt werden, bevor hier irgendetwas gebaut wird.** Bis dahin bewusst
zurückgestellt, nur als offener Punkt dokumentiert.

## LaSi-Selbstanmeldung legt jetzt auch Ladungssicherung_Master-Zeile an (fertig, 11.10.2026)

**Gleiches Problem wie bei Stufe 2 (siehe unten), nachträglich auch bei LaSi
entdeckt:** Nach Abschluss des Stufe-2-Themas beim Gegenchecken aufgefallen,
dass `Ladungssicherung_Master` für Emma Eckmeier trotz `LaSi_gebucht = Ja`
auf `Staplerprufung_Master` **komplett leer** war — derselbe Fehler wie bei
Stufe 2: LaSi hat ebenfalls eine eigene, separate Liste
`Ladungssicherung_Master` (Site "Ausbildung Zentrale", Spalten
`Registrierungsnummer`/intern `Title`, `Name_Teilnehmer`,
`Vorname_Teilnehmer`, `pruefung_lasi_freigegeben`, `Datum_Pruefung`,
`Punkte_Theorie`, `Status_Theorie`, `Pruefer`, `Kommentar`, `Kurse`), gegen
die `Erstpruefung_LaSi_Kandidaten_abrufen` filtert — der Flow
`Teilnehmer_Selbstanmeldung` schrieb bei `kurs=lasi` bisher nur
`LaSi_gebucht`/`LaSi_Schulungsform` auf `Staplerprufung_Master`, legte aber
nichts in `Ladungssicherung_Master` an.

**Einfacher als Stufe 2** (kein Gerät, keine Nachweispflicht), zwei neue
Blöcke in `Teilnehmer_Selbstanmeldung`:

- **Bestandsteilnehmer**: direkt nach "Element aktualisieren 2" (setzt
  `LaSi_gebucht` auf `Staplerprufung_Master`, im Wahr-Zweig von "Ist LaSi
  Anmeldung") ein neues "Elemente abrufen 3" auf `Ladungssicherung_Master`
  (Filter `Title eq '<Title aus dem ursprünglichen Duplikat-Check>'`),
  Bedingung "Hat LaSi Zeile" (`length(...) > 0`): Wahr → nichts tun (sollte
  praktisch nie eintreten), Falsch → "Element erstellen 3" legt die Zeile
  neu an (`Titel`, `Name_Teilnehmer`, `Vorname_Teilnehmer`,
  `Pruefung_lasi_freigegeben = Nein`).
- **Neuanmeldung**: eine neue Bedingung "Ist LaSi Kurs"
  (`triggerBody()?['kurs'] eq 'lasi'`) **parallel neben** (nicht
  verschachtelt in) "Ist Stufe2 Kurs", direkt nach deren Wahr/Falsch-
  Zweigen, noch vor "Hat Nachweis Datei" — Wahr: direkt "Element erstellen
  4" auf `Ladungssicherung_Master` (kein Duplikat-Check nötig, neuer
  Teilnehmer), `Titel` = `variables('varRegnr')`, `Name_Teilnehmer`/
  `Vorname_Teilnehmer` aus dem Trigger.

**Build-Fehler unterwegs:** "Ist LaSi Kurs" wurde beim ersten Versuch (per
Kopieren von "Ist Stufe2 Kurs") versehentlich im **falschen** Zweig
eingefügt — auf der linken (Bestandsteilnehmer-)Seite als vierte,
eigenständige Geschwister-Bedingung neben "Ist Stufe1/Stufe2 Anmeldung",
statt auf der rechten (Neuanmeldungs-)Seite nach "Ist Stufe2 Kurs". Da
diese Fehlplatzierung keinen Duplikat-Schutz hatte, hätte sie bei jeder
erneuten LaSi-Anmeldung eines Bestandsteilnehmers eine zusätzliche,
doppelte Zeile in `Ladungssicherung_Master` erzeugt — vor dem Testen
bemerkt und auf die richtige Seite verschoben. **Lehre:** Beim Kopieren
einer Bedingung in einem Flow mit zwei symmetrischen Zweigen (Bestand vs.
Neu) nach dem Einfügen immer rauszoomen und die Platzierung gegen den
Original-Zweig prüfen, nicht nur den Aktionsnamen.

**Fertig, end-to-end getestet (11.10.2026):** Bestandsteilnehmer-Zweig über
Emma (`2026-002`) bestätigt — Zeile in `Ladungssicherung_Master` korrekt
angelegt. Neuanmeldungs-Zweig zusätzlich mit einem frischen Testdurchlauf
bestätigt. Damit sind jetzt **alle drei Kurstypen** (Stufe 1, Stufe 2 je
Gerät, LaSi) bei der Selbstanmeldung vollständig in ihren jeweiligen
Modul-Listen abgebildet, nicht nur in `Staplerprufung_Master`.

## Stufe-2-Selbstanmeldung legt jetzt auch Staplerprufung_Stufe2-Zeile an (fertig, 11.10.2026)

**Ursprüngliches Problem (10.10.2026):** Ein über den Stufe-2-QR-Code neu
angemeldeter Teilnehmer (Testfall "Karl Meier", `2026-002`) tauchte in
`nachpruefung_theorie.html` bei der Stufe-2-Erstprüfung-Freigabe gar nicht
auf, weil Stufe 2 intern über eine **eigene, separate Liste**
`Staplerprufung_Stufe2` (Site "Ausbildung Zentrale", **nicht**
`Staplerprufung_Master`!) läuft — Spalten `Registrierungsnummer`,
`Name_Teilnehmer`, `Vorname_Teilnehmer`, `Stufe`, sowie **je Gerät ein
eigenes Buchungs-Flag**: `Schubmast_gebucht`, `Kommissionierer_gebucht`,
`Schmalgang_gebucht`. Der Flow `Teilnehmer_Selbstanmeldung` setzte bei
`kurs=stufe2` bisher nur `Stufe2_gebucht`/`Stufe2_Schulungsform` auf
`Staplerprufung_Master`, legte aber nichts in `Staplerprufung_Stufe2` an.
Zusätzlich fragte das Formular nicht ab, welches Gerät der Teilnehmer
macht.

**Entscheidung (11.10.2026): drei getrennte QR-Codes statt Dropdown**, um
Verklicken zu verhindern — analog zur bestehenden Stufe1/Stufe2/LaSi-
Dreiteilung. Umgesetzt:

- **Frontend** (`fahrausweis-check`-Repo): `qr-stufe2.html` ersetzt durch
  drei neue Seiten `qr-stufe2-schubmast.html`, `qr-stufe2-kommissionierer.html`,
  `qr-stufe2-schmalgang.html`, die auf `anmeldung/index.html?kurs=stufe2_schubmast`
  etc. verlinken. `anmeldung/index.html` erkennt diese drei `kurs`-Werte,
  zeigt den passenden Gerätenamen im Titel, setzt intern `geraet` (Schubmast/
  Kommissionierer/Schmalgang) und schickt im Payload weiterhin `kurs:'stufe2'`
  (für die bestehende Master-Logik) **plus** zusätzlich `geraet`. Trainerbereich-
  Links in `trainerbereich.html` auf die drei neuen QR-Seiten umgestellt.
- **Flow `Teilnehmer_Selbstanmeldung`** erweitert um zwei neue Blöcke:
  - **Bestandsteilnehmer** (zweites Gerät für bereits laufenden Stufe-2-
    Teilnehmer): direkt nach dem bestehenden "Element aktualisieren 1"
    (setzt `Stufe2_gebucht` auf `Staplerprufung_Master`) ein neues "Elemente
    abrufen" auf `Staplerprufung_Stufe2` (Filter `Registrierungsnummer eq
    '<Title aus dem ursprünglichen Duplikat-Check>'`), Bedingung "Hat Stufe2
    Zeile" (`length(...) > 0`): Wahr → "Element aktualisieren" setzt nur die
    passende Gerätespalte auf `true`, die anderen bleiben beim bisherigen
    Wert (`if(equals(triggerBody()?['geraet'],'Schubmast'), true, first(...)
    ?['Schubmast_gebucht'])` je Spalte); Falsch → "Element erstellen" legt
    die Zeile neu an (`Registrierungsnummer`, `Name_Teilnehmer`,
    `Vorname_Teilnehmer`, `Stufe=2`, je Gerätespalte `equals(triggerBody()?
    ['geraet'], '<Gerät>')`).
  - **Neuanmeldung**: nach dem bestehenden "Element erstellen" (Master) eine
    neue Bedingung "Ist Stufe2 Kurs" (`triggerBody()?['kurs'] eq 'stufe2'`)
    → Wahr: direkt "Element erstellen" auf `Staplerprufung_Stufe2` (kein
    Duplikat-Check nötig, da neuer Teilnehmer zwangsläufig noch keine
    Stufe2-Zeile hat), dieselben Felder wie oben, Registrierungsnummer über
    `variables('varRegnr')`.

**Zweiter Build-Fehler beim Bestandsteilnehmer-Update, gefunden und gefixt
(11.10.2026):** Zwei Probleme mit dem ursprünglichen "Hat Stufe2 Zeile" →
Wahr-Update:
- Der Filter `Registrierungsnummer eq '...'` im "Elemente abrufen 2" auf
  `Staplerprufung_Stufe2` schlug mit `Die Spalte 'Registrierungsnummer'
  ist nicht vorhanden` fehl — klassische Title-Falle (siehe oben): die
  Spalte heißt in der UI "Registrierungsnummer", intern aber `Title`.
  Fix: Filter auf `Title eq '...'` umgestellt.
- Der Ansatz, beim Update eines zweiten Geräts die jeweils anderen zwei
  Gerätespalten per `if(equals(...), true, first(outputs(...)?['...']))`
  auf ihrem alten Wert zu halten, hat NICHT funktioniert — der
  Rücklese-Teil lieferte `null` statt des erwarteten Vorwerts, wodurch
  z.B. ein bereits gesetztes `Schubmast_gebucht=Yes` beim Buchen von
  Kommissionierer auf leer überschrieben wurde. **Fix:** Die einzelne
  "Element aktualisieren"-Aktion durch eine **"Wechseln" (Switch)**-Aktion
  auf `triggerBody()?['geraet']` ersetzt, mit drei Cases (`Schubmast`/
  `Kommissionierer`/`Schmalgang`), die jeweils **nur ihre eigene**
  Gerätespalte als Parameter setzen (keine der anderen beiden anfassen).
  Da SharePoint "Element aktualisieren" nur die mitgeschickten Felder
  überschreibt, bleiben die nicht angefassten Spalten automatisch
  unverändert — kein Rücklesen/Vorwert-Handling mehr nötig. **Lehre:**
  Bei "diesen einen Wert ändern, Rest soll bleiben wie er ist"-Logik in
  Power Automate immer bevorzugt das betroffene Feld schlicht aus dem
  Update weglassen, statt den alten Wert aktiv zurückzulesen und erneut
  mitzuschreiben — letzteres ist fehleranfällig.

**Wichtiger Build-Fehler, neu entdeckt (11.10.2026):** Beim Einfügen der
neuen verschachtelten Aktionen sind drei **vorbestehende, unveränderte**
"Element aktualisieren"-Schritte (Stufe1_gebucht, Stufe2_gebucht/
Stufe2_Schulungsform, LaSi_gebucht/LaSi_Schulungsform auf
`Staplerprufung_Master`) beim Veröffentlichen mit `'Element' muss
angegeben werden` bzw. `'Item.item/<Feld>' ist im Vorgangsschema nicht
mehr vorhanden` fehlgeschlagen — reines Entfernen+Neuhinzufügen der
einzelnen Parameterzeile über "Erweiterte Parameter" hat NICHT gereicht
(Fehler blieb auch bei leerem Wert bestehen). Einzig zuverlässiger Fix:
die komplette Aktion löschen und an gleicher Stelle neu anlegen. **Lehre:**
Bei verschachtelten Bedingungen können unabhängig von der eigentlichen
Änderung benachbarte, eigentlich unberührte "Element aktualisieren"-
Schritte ihre Feld-Bindung verlieren (Power-Automate-Schema-Drift) — im
Zweifel nicht stundenlang an der kaputten Parameterzeile herumreparieren,
sondern die betroffene Aktion komplett neu aufbauen.

**Weitere Falle beim Neuaufbau:** `schulungsform` ist im Trigger-JSON-
Schema nicht deklariert (obwohl das Frontend es im Payload mitschickt) und
taucht deshalb im Dynamischer-Inhalt-Picker nicht auf — funktioniert aber
trotzdem zuverlässig per Hand-Ausdruck `triggerBody()?['schulungsform']`
im fx-Editor.

**Falle bestätigt:** `LaSi_gebucht`/`LaSi_Schulungsform` sitzen (wie
`Stufe1_gebucht`/`Stufe2_gebucht`) auf `Staplerprufung_Master`, **nicht**
auf `Ladungssicherung_Master` — letzteres ist nur die eigene Liste für die
Freigabe-Flows (`pruefung_lasi_freigegeben`), nicht für die Buchung. Beim
Neuanlegen der Aktion schlägt Power Automate automatisch ein ähnlich
klingendes, aber falsches Feld vor (`Pruefung_lasi_freigegeben`) — Liste
und Feldname beim Neuaufbau immer gegen die SharePoint-Struktur-Doku oben
prüfen, nicht das Auto-Vorschlagsfeld blind übernehmen.

**Fertig, end-to-end getestet (11.10.2026, Testfall "Emma Eckmeier",
`2026-002`):** Neuanmeldung über Schubmast-QR-Code (Zeile in beiden Listen
korrekt angelegt, inkl. Nachweis-Upload), danach zweimal erneut über
Kommissionierer- und Schmalgang-QR-Code mit identischen Personendaten
angemeldet (Update statt Neuanlage, gleiche Regnr `2026-002` beide Male) —
am Ende stehen `Schubmast_gebucht`/`Kommissionierer_gebucht`/
`Schmalgang_gebucht` alle drei korrekt auf Yes nebeneinander, keine
gegenseitige Überschreibung mehr. Zusätzlich im Trainerbereich bestätigt:
Emma taucht in `nachpruefung_theorie.html` bei "Stufe 2 Erstprüfung bereit"
korrekt unter allen drei Geräte-Tabs auf; "Erstprüfung freigeben" im
Schubmast-Tab setzt in `Staplerprufung_Stufe2` ausschließlich
`Pruefung_Schubmast_Freigegeben = Ja`, Kommissionierer/Schmalgang bleiben
unberührt auf Nein.

**Regressionstest der beim Neuaufbau mit-betroffenen Stufe1-/LaSi-
Aktionen (11.10.2026):** Da "Element aktualisieren" (Stufe1) und "Element
aktualisieren 2" (LaSi) im selben Flow wegen des Schema-Drift-Bugs
ebenfalls komplett neu aufgebaut werden mussten (siehe oben), sicherheits-
halber nochmal eine Bestandsanmeldung je Kurs getestet: Emma zusätzlich
über den Stufe1- und den LaSi-QR-Code angemeldet — in `Staplerprufung_
Master` stehen danach `Stufe1_gebucht`/`LaSi_gebucht` korrekt mit
`Präsenz` als Schulungsform. Keine Regression durch den Neuaufbau.

## Theorieprüfungen freigeben: ELearning_Zugang mit-setzen + Entziehen-Button (10.10.2026)

Daniel musste bisher **zweimal** manuell ran, um einen Teilnehmer zur
Theorieprüfung zuzulassen: einmal "Prüfung freigeben" in
`nachpruefung_theorie.html` (setzt `Pruefung_Stufe1_Freigegeben`/
`Pruefung_Kommissionierer_Freigegeben`/etc. bzw. `Pruefung_lasi_freigegeben`),
und zusätzlich manuell `ELearning_Zugang` in SharePoint auf `Ja`, sonst kam
der Teilnehmer über `login.html` gar nicht erst in den Teilnehmerbereich
rein (der Login-Flow `ELearning_Zugangspruefung` blockt komplett, wenn
`ELearning_Zugang` nicht `Ja` ist).

**Gelöst:** Alle drei Freigeben-Flows (`Stufe1_Nachpruefung_freigeben` für
Stufe 1 Erst- UND Nachprüfung, `Stufe2_Nachpruefung_freigeben` für Stufe 2
Erst- UND Nachprüfung je Gerät, `LaSi_Nachpruefung_freigeben` für LaSi Erst-
UND Nachprüfung) setzen jetzt bei `aktion:'freigeben'` **zusätzlich**
`ELearning_Zugang = Ja` mit. Bei Stufe 2 und LaSi läuft das Haupt-Update
gegen die jeweils eigene Liste (`Staplerprufung_Stufe2` bzw.
`Ladungssicherung_Master`), `ELearning_Zugang` sitzt aber nur in
`Staplerprufung_Master` — deshalb zusätzlicher Nachschlage-Schritt
("Elemente abrufen" mit `Title eq '<regnr>'` auf `Staplerprufung_Master`,
dann "Element aktualisieren" dort). **Wichtiger Build-Fehler, der dabei
auftrat:** Der Nachschlage-Schritt wurde versehentlich erst **nach** dem
darauf aufbauenden "Element aktualisieren"-Schritt platziert (bzw. nur in
einem Bedingungszweig statt davor) — Power Automate verweigert dann beim
Veröffentlichen mit `InvalidTemplate`/`cannot reference action ... must
either be in runAfter path`. Immer darauf achten, dass ein referenzierter
"Elemente abrufen"-Schritt wirklich **unconditioned davor** in der
Ausführungsreihenfolge steht, nicht nur in einem Bedingungszweig.

**Zusätzlich: Entziehen-Button.** Ursprünglich war ein eigenständiges
Trainer-Tool "Zugang verwalten" geplant (Lookup per Regnr + Frei-/Entzieh-
Button), wurde aber wieder verworfen zugunsten einer einfacheren Lösung:
Jede Freigeben-Kachel in `nachpruefung_theorie.html` hat jetzt direkt einen
zweiten Button **"Entziehen"** daneben (erscheint nur, wenn schon
freigegeben), der denselben Flow mit `aktion:'entziehen'` aufruft — setzt
dann sowohl das jeweilige `Pruefung_*_Freigegeben`-Flag als auch
`ELearning_Zugang` zurück auf `Nein`. Alle drei Flows haben dafür eine
Wahr/Falsch-Bedingung auf `triggerBody()?['aktion']` um jeden
"Element aktualisieren"-Schritt bekommen (Wahr=`freigeben`→Ja, Falsch=
alles andere→Nein).

**Separater Bug gefunden und gefixt:** Die Kandidaten-Liste für "Stufe 1
Erstprüfung bereit" (`Erstpruefung_Stufe1_Kandidaten_abrufen`, Filter lief
gegen `Staplerprufung_Master`) filterte nur nach
`Status_Theorie eq null or Status_Theorie eq ''` — **ohne** zu prüfen, ob
`Stufe1_gebucht` überhaupt `Ja` ist. Da `Staplerprufung_Master` **alle**
Teilnehmer enthält (nicht nur Stufe-1-Gebuchte), tauchten dadurch
Teilnehmer, die z.B. nur Stufe 2 gebucht hatten, fälschlich auch in der
Stufe-1-Freigabeliste auf. **Fix:** Filter auf
`(Status_Theorie eq null or Status_Theorie eq '') and Stufe1_gebucht eq 1`
erweitert (Klammern wichtig!). **Betrifft nur Stufe 1** — `Staplerprufung_
Stufe2` und `Ladungssicherung_Master` sind eigene, exklusive Listen (nur
Teilnehmer, die diesen Kurstyp wirklich gebucht haben), brauchen also
keinen zusätzlichen Buchungs-Filter. Die Stufe-1-**Nachprüfung**-Variante
(`Stufe1_Nachpruefung_Kandidaten_abrufen`, Filter
`Status_Theorie eq 'nicht Bestanden'`) ist von diesem Bug nicht betroffen,
da ein "nicht bestanden"-Status denknotwendig eine vorherige Stufe-1-Prüfung
voraussetzt — bewusst unverändert gelassen.

## Stempeluhr & Vor-Ort-Teilnehmeranmeldung (ab 07.10.2026, Ziel 13.10.2026)

Zwei neue, von allen bisherigen Systemen unabhängige Features, angestoßen durch
die Hofmann-Kooperation (Dozententätigkeit vor Ort, Abrechnung über Honorar statt
über die normale Kursbuchung):

- **Stempeluhr** (`stempeluhr.html`, verlinkt im Trainerbereich): Ein-/Ausstempel-
  Button für Daniels eigene Arbeitszeit, Basis für die Dozenten-Honorarabrechnung
  (kein Stripe/Teilnehmer-Rechnung, reine Zeiterfassung). **Fertig, end-to-end
  getestet (09.10.2026).** Flow `Stempeluhr` (HTTP-Trigger, Site "ProDrive
  Verwaltung") bedient `{aktion:'status'}` → `{offen:bool, eintrag:{einstempelzeit,
  schulung, firma}}`, `{aktion:'einstempeln', firma, schulung, notiz}` →
  `{success:true}`, `{aktion:'ausstempeln', notiz}` → `{success:true, dauer}`
  gegen die SharePoint-Liste `Dozent_Zeiterfassung` (Site "ProDrive
  Verwaltung", Felder: Titel=Firma als Freitext, Einstempelzeit/Ausstempelzeit
  Datum+Uhrzeit, Dauer Einzeiliger Text, Notiz Einzeiliger Text, Status Auswahl
  Offen/Abgeschlossen, Schulung Auswahl Stufe 1/Stufe 2/LaSi). Frontend-seitig:
  Firma als Dropdown (feste, im Code erweiterbare Liste, aktuell nur "Hofmann
  GmbH", + "Andere…"-Freitext-Fallback), Schulung als Dropdown, Notiz separates
  optionales Freitextfeld.

  **Stundenzettel-PDF (fertig, 09.10.2026):** Eigener, unabhängiger Flow
  `Stundenzettel_Monatlich` (Wiederholung-Trigger, läuft automatisch **jeden 1.
  eines Monats um 06:00**, Zeitzone Romance Standard Time — kein manuelles
  Anstoßen nötig). Berechnet sich selbst den kompletten **Vormonat** als
  Zeitraum (`varVon`/`varBis`), geht pro Firma aus einer fest hinterlegten
  Liste (`varFirmenListe`, aktuell `["Hofmann GmbH"]` — **bei neuer Firma muss
  diese Variable im Flow-Editor manuell erweitert werden**, keine automatische
  Erkennung) alle `Abgeschlossen`-Einträge im Zeitraum durch, baut daraus eine
  HTML-Tabelle (Datum/Schulung/Notiz/Dauer), summiert die Minuten (Berechnung
  über `ticks()`-Differenz Ein-/Ausstempelzeit, nicht über das Text-Dauerfeld)
  und berechnet das Honorar mit einem **festen Stundensatz von 75 €/h**
  (Platzhalter, noch nicht final mit Hofmann verhandelt — maßgeblich bleibt der
  Tagessatz 550-650€ Praxistag / 600-650€ LaSi, Stundensatz ist nur die
  rechnerische Umlegung). PDF wird erzeugt (OneDrive HTML→PDF-Konvertierung)
  und in einer **eigenen neuen Dokumentbibliothek "Stundenzettel"** auf Site
  "ProDrive Verwaltung" abgelegt (bewusst nicht in "Rechnungen", eigene
  Ablage gewünscht), Dateiname `Stundenzettel_<Firma>_<Jahr-Monat>.pdf`. Kein
  automatischer Versand/E-Mail — nur Ablage, Daniel ruft sich die PDFs bei
  Bedarf selbst ab.

  **Power-Automate-Fallstricke (neu, beim Bau dieses Flows entdeckt):**
  - Ein Ausdruck wie `items('Auf_alle_anwenden')`, der von Hand (nicht über
    den Dynamische-Inhalte-Picker) in ein Textfeld eingetippt wird, wurde
    mehrfach vom Designer stillschweigend zu `items('')` zurückgesetzt, ohne
    Fehlermeldung beim Eintragen — erst `Veröffentlichen` schlug dann mit der
    kryptischen Meldung `The name of template action '' ... is not defined`
    fehl. **Zuverlässiger Fix:** eine eigene Variable (`varAktuelleFirma`)
    anlegen, deren Wert als allererste Aktion in der Schleife **ausschließlich
    über den Dynamische-Inhalte-Picker** ("Aktuelles Element") gesetzt wird,
    und diese Variable überall sonst referenzieren statt direkt `items(...)`
    einzutippen.
  - **Fehlende Connector-Verbindung erzeugt denselben irreführenden
    Fehlertext** (`template action '' ... not defined`) beim Veröffentlichen
    — hat nichts mit einem Ausdrucksfehler zu tun. Der eigentliche Grund
    steht nur sichtbar, wenn man die betroffene Aktion einzeln öffnet (hier:
    "Es fehlt eine Verbindung für 'Datei erstellen'"). Bei dieser generischen
    Fehlermeldung immer zuerst jede Datei-/Connector-Aktion einzeln auf eine
    gültige Verbindung prüfen, bevor man Ausdrücke durchsucht.
  - **Kritisch:** Wenn "Entwurf speichern"/"Veröffentlichen" wegen eines
    solchen Fehlers fehlschlägt, bleibt der Flow nur als **ungespeicherte
    Kopie im Browser** bestehen (Banner "Ihr Browser speichert eine nicht
    gespeicherte Kopie dieses Flows"). Wird dieser Banner verworfen oder die
    Seite in einem neuen/privaten Fenster geöffnet, geht der komplette
    ungespeicherte Fortschritt verloren (ist einmal passiert, die komplette
    Firmen-Schleife musste neu aufgebaut werden). Bei einem Veröffentlichen-
    Fehler also **zuerst die eigentliche Fehlerursache beheben (siehe oben),
    dann speichern** — nicht den Banner wegklicken oder die Seite in einem
    neuen Tab/Fenster erneut öffnen, bevor erfolgreich gespeichert wurde.
  - Ein als `''` (leere Zeichenfolge) gedachter Wert in einem "Variable
    festlegen"-Wert-Feld wurde wiederholt beim erneuten Testen/Speichern auf
    leer zurückgesetzt und erzeugte dann `'Wert' muss angegeben werden`.
    Weder über das normale Textfeld noch über den fx-Formel-Editor zuverlässig
    lösbar. **Funktionierender Workaround:** ein einzelnes Leerzeichen `' '`
    statt eines echten Leerstrings eintragen — bleibt beim Rendern in HTML
    unsichtbar, aber das Feld gilt nicht mehr als leer und der Fehler bleibt
    weg.
- **Teilnehmeranmeldung** (Vor-Ort-Selbstanmeldung per 3 getrennten QR-Codes,
  Stufe 1/Stufe 2/LaSi getrennt damit sich Teilnehmer nicht verklicken).
  **Fertig, end-to-end getestet (10.10.2026)**, siehe Details unten. Bewusst
  **nicht** über die bestehende "Anmeldung HP"-Flow-Pipeline (erzeugt immer
  eine Stripe-Rechnung pro Teilnehmer, hier nicht gewünscht, da Abrechnung
  separat über Honorar läuft).

  **Felder in `Staplerprufung_Master` bestätigt (09.10.2026, per Screenshot aus
  dem "Element erstellen"-Schritt in "Anmeldung HP"), relevant für die
  Selbstanmeldung:** `Titel` (=Registrierungsnummer), `Name_Teilnehmer`,
  `Vorname_Teilnehmer`, `Geburtsdatum`, `Geburtsort`, `Email_Teilnehmer`,
  `Telefonnummer_Teilnehmer`, `Strasse`, `PLZ`, `Ort` — **alle existieren
  bereits**, keine neuen Spalten nötig. Außerdem vorhanden (für die
  Selbstanmeldung evtl. nicht gebraucht, aber zur Vollständigkeit):
  `Stufe1_gebucht`, `Stufe1_Schulungsform` (Choice), `Stufe2_gebucht`,
  `Stufe2_Schulungsform` (Choice), `LaSi_gebucht`, `LaSi_Schulungsform`
  (Choice), `Training_gebucht`, `Nachweis_Stufe1_vorhanden` (Choice),
  `Anmeldungsart` (Choice), `Firma`, `Kurse` (Lookup). Zusätzlich bestätigt:
  `Status_Theorie` und `StatusPraxis` (Choice-Felder) — zusammen `Bestanden`
  heißt "Stufe 1 komplett abgeschlossen" (wie auch schon von der
  Fahrausweis-Verifikation-Seite im `fahrausweis-check`-Repo geprüft).

  **Flow `Teilnehmer_Selbstanmeldung` fertig, end-to-end getestet
  (10.10.2026):** Frontend (`fahrausweis-check`-Repo,
  `anmeldung/index.html` + `anmeldung/qr-stufe1.html`/`qr-stufe2.html`/
  `qr-lasi.html`) ist fertig und mit der echten Flow-URL verbunden. Flow-
  Logik: HTTP-Trigger nimmt `{kurs, nachname, vorname, geburtsdatum,
  geburtsort, schulungsform, email, telefon, strasse, plz, ort,
  nachweis_stufe1_base64, nachweis_stufe1_dateiname}` entgegen, prüft per
  Name+Vorname+Geburtsdatum auf `Staplerprufung_Master`, ob der Teilnehmer
  schon existiert — wenn ja, wird nur das passende `*_gebucht`-Flag +
  `*_Schulungsform` ergänzt (`Element aktualisieren`), wenn nein wird eine
  neue Registrierungsnummer vergeben (`YYYY-NNN`, gleiches Zähler-Pattern
  wie bei Rechnungsnummern über `Elemente abrufen` sortiert nach `Title
  desc`, Top 1) und ein neuer Eintrag angelegt. Jede erfolgreiche Anmeldung
  verschickt eine Bestätigungsmail mit der Registrierungsnummer (Vorbild:
  "Anmeldung HP" macht das genauso bei jeder Fernanmeldung).

  **Stufe-2-Nachweispflicht (09.10.2026, gerade fertig gebaut, noch nicht
  getestet):** Bei `kurs=stufe2` muss der Teilnehmer entweder bereits
  `Status_Theorie eq 'Bestanden' and StatusPraxis eq 'Bestanden'` haben
  (Stufe 1 komplett bei uns gemacht) **oder** einen Nachweis hochladen
  (Frontend zeigt dann ein Datei-Upload-Feld, als Base64 mitgeschickt).
  Fehlt beides, antwortet der Flow mit `{success:false,
  error:'nachweis_fehlt'}`, ohne irgendwas in SharePoint zu schreiben;
  Frontend zeigt dann gezielt den Upload-Hinweis. Umgesetzt über eine
  Hilfsvariable `varNachweisFehlt` (Boolean), die die finale
  E-Mail+Antwort-Kette am Ende jedes Zweigs absichert (sonst würden
  E-Mail/Erfolgsantwort trotzdem laufen, da sie strukturell außerhalb der
  Nachweis-Prüfungs-Bedingung liegen). Hochgeladene Nachweise landen in der
  Dokumentbibliothek `/Nachweise` auf Site "Ausbildung Zentrale" (genau wie
  bei der Fernanmeldung über "Anmeldung HP"), Dateiname `<Regnr>_<Original-
  Dateiname>`, danach wird `Nachweis_Stufe1_vorhanden = ja` gesetzt.

  **Fertig, end-to-end getestet (10.10.2026), alle drei Testfälle grün:**
  (1) bestehender Teilnehmer mit bestandener Stufe 1 meldet sich zu Stufe 2
  an → kein Nachweis nötig, Flag + Schulungsform korrekt ergänzt; (2) neuer
  Teilnehmer, direkt Stufe 2 ohne Nachweis → `nachweis_fehlt`, keine Zeile
  angelegt; (3) neuer Teilnehmer, Stufe 2 mit Foto-Upload → erfolgreich
  angelegt, Datei landet in `/Nachweise`.

  **Fix beim Testen gefunden:** `Status_Theorie`/`StatusPraxis` liefern bei
  "Elemente abrufen" einen **reinen String** zurück, nicht wie andere
  Choice-Felder ein Objekt mit `.Value` — `?['Status_Theorie']?['Value']`
  wirft dadurch einen harten Typfehler (`Property selection is not
  supported on values of type 'String'`), der auch nicht durch `coalesce()`
  abgefangen werden kann (die Property-Selektion selbst crasht, bevor
  `coalesce` greift). Fix: `?['Value']` bei diesen beiden Feldern einfach
  weglassen, direkt `?['Status_Theorie']`/`?['StatusPraxis']` verwenden.
  **Lehre:** Nicht pauschal annehmen, dass jedes Choice-Feld als
  `{Value:"..."}`-Objekt zurückkommt — im Zweifel per Testlauf/Codeansicht
  gegenprüfen, welche Form das jeweilige Feld tatsächlich hat.

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
Zusätzlich (per Screenshot 13.10. bestätigt) vorhanden: `Firma`,
`Anmeldungsart`, Ansprechpartner-Block `AP_Vorname`/`AP_Nachname`/
`AP_Email`/`AP_Telefon`, `Abgesagt`, `Kurse` (+ Lookup-Unterspalten wie
`Kurse: Kurs_Beginn`). Bei gewerblicher Anmeldung über `anmeldung.html`
wird `firma` im Payload an den Flow "Anmeldung HP" mitgeschickt und landet
dort im `Firma`-Feld — die Rohdaten pro Firma sind also bereits vorhanden.
**Es gibt aber noch keine fertige Auswertung/Filteransicht im Cockpit**,
die Teilnehmer nach Firma filtert (z.B. "alle Teilnehmer von Firma X") —
das wäre bei Bedarf eine kleine Ergänzung auf Basis bestehender Daten,
kein Neubau. Hintergrund: Kam im Zuge von Kooperationsgesprächen mit
I. K. Hofmann GmbH auf (siehe Cockpit-Akquise-Tab) — Hofmann würde
interessieren, ob bei ihnen durchgeführte Schulungen separat zuordenbar
wären.

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

**Wichtig, am 05.09.2026 korrigiert:** Die Aktion "Stripe Preis erstellen 1"
hatte einen **Stripe-Test-Key** (`sk_test_...`) statt des Live-Keys
hinterlegt — dadurch wären in diesem Zweig erzeugte Zahlungslinks nicht
mit echtem Geld bezahlbar gewesen. Wurde auf den Live-Key korrigiert
(gleicher Key wie bei "Stripe Preis erstellen"/"Stripe Zahlungslink
erstellen" ohne die "1"). Bei künftigen Änderungen an Stripe-Schritten in
diesem Flow immer den Key-Typ gegenprüfen.

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
  Kurs-Option `"Jährliche Unterweisung Flurförderzeuge"` — Spalten
  `Firmenname` und `Schulungsform` (Wert `Präsenz`) existierten dort
  bereits; neu ergänzt: `Unternehmens_ID` (Einzeiliger Text, zur
  Rückverfolgung zur Unterweisung_Unternehmen-Zeile).

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
  zurück; prüft danach Vollständigkeit (**alle** Teilnehmer haben Status
  `Unterschrieben` — `Entschuldigt` blockiert die Rechnung bewusst
  weiterhin, siehe unten) und legt bei Abschluss automatisch eine einfache
  Rechnungszeile in `Zahlungen` an (Rechnungsnummer nach demselben Schema
  wie "Anmeldung HP", Betrag nach Preisstaffel), plus eine Sperre gegen
  mehrfaches Abschließen (siehe unten). **Fertig, end-to-end getestet
  (05.09.2026, Testfirma "Musterlager Landshut GmbH").** Die volle
  Stripe-Zahlungslink- + PDF-Rechnung- + E-Mail-Pipeline (analog "Anmeldung
  HP") ist bewusst **noch nicht gebaut** — separater, späterer Ausbauschritt.

**Preislogik Jährliche Unterweisung** (bestätigt, netto/brutto noch klären
falls relevant): pro Teilnehmer gestaffelt — 1–3 TN: 89€, 4–6 TN: 69€, 7+ TN:
55€ (keine weitere Stufe ab 9+, bleibt bei 55€) — plus Mindestpauschale
300€ pro Termin, es gilt der höhere der beiden Beträge:
`Betrag = max(300, Teilnehmerzahl × Preis/TN)`.

**Vollständigkeits-Entscheidung (wichtig, nachträglich geändert):** Ein
`Entschuldigt`-Teilnehmer blockiert die Rechnungsstellung genauso wie
`Offen` — nur wenn wirklich **alle** `Unterschrieben` sind, wird
abgerechnet. Ursprünglich war geplant, dass `Entschuldigt` die Rechnung
nicht aufhält (damit ein einzelner Urlaub die Abrechnung nicht blockiert),
das wurde aber bewusst verworfen: die Buchung soll erst als inhaltlich
abgeschlossen gelten, wenn wirklich jeder schult wurde. Die Liste bleibt
trotzdem jederzeit mit offenen/entschuldigten Teilnehmern zwischenspeicherbar
und über die `Unternehmens_ID` wieder aufrufbar — das betrifft nur den
Zeitpunkt der Rechnungsstellung, nicht das Speichern selbst.

**Rechnungsnummer-Vergabe** (im Flow `UNTERWEISUNG_SPEICHERN_URL`
implementiert, exakt wie in "Anmeldung HP"): Format `RE-YYYY-NNN`, zählt
pro Jahr neu, ermittelt über `startswith(Rechnungsnummer,'RE-<Jahr>')` auf
`Zahlungen` + `desc`-Sortierung + Top 1, dann letzte Zahl +1. Läuft in
derselben Nummernreihe wie alle anderen Kurstypen (keine Kollisionsgefahr,
da dieselbe Liste/Abfrage verwendet wird).

**Sperre gegen mehrfaches Abschließen:** Vor der Rechnungsnummer-Vergabe
prüft der Flow per "Elemente abrufen", ob die zugehörige
`Unterweisung_Buchungen`-Zeile (Filter `Title eq <Unternehmens_ID> and
Status eq 'Offen'`) noch offen ist — nur dann wird überhaupt eine Rechnung
angelegt. Nach dem "Element erstellen" in `Zahlungen` wird diese
Buchungs-Zeile per "Element aktualisieren" auf `Status = Abgeschlossen`
gesetzt (inkl. `Rechnungsnummer`). Ohne diese Sperre erzeugt jedes erneute
Speichern (z.B. nach einem "Zurücksetzen") eine weitere, doppelte
Rechnungszeile.

**Power-Automate-Fallstricke (neu entdeckt beim Bau dieses Flows):**
- `Variable initialisieren` darf **nicht** innerhalb einer Bedingung/eines
  Scopes verschachtelt sein (Fehler `InvalidVariableInitialization`) —
  alle "Initialize variable"-Schritte müssen auf der obersten Flow-Ebene
  stehen (Startwert dort simple Konstante, z.B. `0` oder leerer Text). Die
  eigentliche Berechnung erfolgt dann per `Variable festlegen` (Set
  variable) innerhalb der Verzweigung.
- `first(body('Aktionsname'))` funktioniert **nicht** direkt auf einer
  SharePoint-"Elemente abrufen"-Ausgabe — `body(...)` liefert ein Objekt
  `{value: [...]}`, kein Array. Richtig: `first(outputs('Aktionsname')?
  ['body/value'])`. Dieser Bug blieb lange unbemerkt, weil er nur im
  "Rechnungsnummer erhöhen"-Zweig auftrat (erste Rechnung eines Jahres
  nimmt den Falsch-Zweig ohne `first(...)`-Aufruf).
- Aktionsnamen dürfen keine Sonderzeichen wie `?`, `/`, `&` enthalten
  (Fehler `InvalidWorkflowRunActionName`) — auch beim Umbenennen eigener
  Bedingungen/Schritte beachten (z.B. "Buchung noch offen?" → ungültig,
  "Buchung noch offen" → gültig).
- Verschachtelungstiefe beim Verschieben von Aktionen per Drag & Drop
  zwischen Bedingungs-Kästen ist fehleranfällig — nach jedem Verschieben
  die Diagrammansicht (rausgezoomt) gegenprüfen, nicht nur den einzelnen
  Aktions-Screenshot.

**Cockpit-Anpassung:** `cockpit.html`, LoP-Liste (`var wer = ...`) hat
jetzt `r.Firmenname` als Fallback zwischen Name/Vorname und "Unbekannt",
damit Unterweisung-Rechnungszeilen (keine Einzelperson) dort lesbar
erscheinen statt "Unbekannt".

**Offen für später:** Stripe-Zahlungslink, PDF-Rechnung, E-Mail-Versand
(zwei getrennte E-Mails: Rechnung + unterschriebene Liste) für die
Unterweisung — eigener, separat zu planender Ausbauschritt, analog zur
"Anmeldung HP"-Pipeline (siehe oben). Bis dahin zeigt
`unterweisung_unterschriften.html` bei Abschluss nur "Rechnung wurde
erstellt", nicht "wurde verschickt" — es geht noch keine E-Mail raus.
**Stand 05.09.2026: dieser Ausbauschritt wird jetzt begonnen** (siehe
nächster Abschnitt).

## Unterweisung-Rechnung: Stripe/PDF/E-Mail-Ausbau (fertig, 05.09.2026)

**Entscheidung zu kombinierten Buchungen** (Stufe1/2/LaSi + Unterweisung
gleichzeitig, z.B. Stufe 1 für 3 Personen + Unterweisung für 25
Mitarbeiter): Bleiben **zwei komplett getrennte Rechnungen**, keine
Zusammenführung. Grund: Stufe1/2/LaSi werden sofort bei Buchung über
"Anmeldung HP" abgerechnet, die Unterweisung aber bewusst erst wenn
wirklich alle Mitarbeiter geschult (unterschrieben) sind — das kann Wochen
dauern und lässt sich nicht sinnvoll mit einer Sofort-Rechnung
zusammenlegen. Eine Integration der Unterweisung direkt in "Anmeldung HP"
(wie die anderen Kurstypen, inkl. Sammelanmeldung-Logik) wurde diskutiert
und **verworfen**, genau aus diesem Zeitpunkt-Grund. Die
Rechnungsnummer-Sequenz bleibt trotzdem gemeinsam/fortlaufend (siehe oben).

**Ablage-Entscheidung:** PDF-Rechnungen der Unterweisung landen in
**derselben** SharePoint-Dokumentbibliothek "Rechnungen" (Site "ProDrive
Verwaltung") wie die Stufe1/2/LaSi-Rechnungen — keine eigene Bibliothek,
damit alle Rechnungen an einem Ort auffindbar bleiben (konsistent mit der
gemeinsamen Rechnungsnummer-Sequenz).

**Zurückgestellt, nicht vergessen:** Auch `angebot.html` (Angebots-Rechner
mit E-Mail-Bestätigungslink zur finalen Buchung) bietet die Jährliche
Unterweisung bisher nicht als Option an (siehe `PREISE`-Objekt dort, kein
`unterweisung`-Schlüssel). Soll perspektivisch ergänzt werden, ist aber
explizit kein Teil des aktuellen Stripe/PDF/E-Mail-Ausbauschritts.

**Umsetzung:** Die komplette Kette aus "Anmeldung HP" (Sammel-Zweig) wurde
per Copy&Paste in `UNTERWEISUNG_SPEICHERN_URL` übernommen (Logo laden
Sammel → Stripe Preis erstellen 1 → Stripe Zahlungslink erstellen 1 → QR
Code laden 1 → Rechnung HTML gesammelt Sammel → Datei erstellen Sammel →
Datei konvertieren Sammel → Datei erstellen SharePoint Sammel → E-Mail
senden Sammel), eingefügt im Wahr-Zweig von "Buchung noch offen" nach
"Element aktualisieren 1". Power Automate erhält beim Kopieren alle
Aktionsnamen — dadurch funktionieren die meisten Verweise zwischen den
kopierten Schritten automatisch (z.B. QR-Code-Schritt verweist einfach
auf `Stripe_Zahlungslink_erstellen_1`, unverändert). Angepasst werden
mussten nur die Verweise auf die alten "Anmeldung HP"-spezifischen
Variablen/Felder:
- `VarNeueRechnungsnummer` → `varRechnungsnummer` (Stripe Preis erstellen 1,
  Stripe Zahlungslink erstellen 1, Rechnung-HTML, Datei erstellen Sammel,
  Datei erstellen SharePoint Sammel, E-Mail Betreff/Anhang-Name)
- `VarGesamtbetrag` → `varBetrag`, `VarSammelID`/Registrierungsnummer im
  Stripe-Metadata → `triggerBody()?['unternehmens_id']`
- `VarLeistungenHTMLGruppiert` (mehrere Positionen) → eine feste einzelne
  Position "Jährliche Unterweisung Flurförderzeuge (@{varAnzahl}
  Teilnehmer)"
- Empfänger/Anrede (`triggerBody()?['ansprechpartner_email']` etc. — gibt
  es in unserem Trigger nicht): neuer Schritt **"Unternehmen Kontakt
  abrufen"** (Elemente abrufen, Unterweisung_Unternehmen, Filter `Title eq
  '@{triggerBody()?['unternehmens_id']}'`) direkt vor "Logo laden Sammel"
  eingefügt; E-Mail-Empfänger = `first(outputs('Unternehmen_Kontakt_abrufen')?['body/value'])?['Email_AP']`,
  Anrede vereinfacht auf `Sehr geehrte Damen und Herren von @{triggerBody()?['firma']}`
  (keine Ansprechpartner-Vor-/Nachname-Trennung nötig)
- **Stripe-Key**: Die kopierte Aktion "Stripe Preis erstellen 1" hatte
  ursprünglich (auch im Original-Flow "Anmeldung HP"!) einen **Test-Key**
  (`sk_test_...`) statt des Live-Keys hinterlegt — in beiden Flows auf den
  Live-Key korrigiert.

**Power-Automate-Fallstrick: Hyperlinks mit dynamischem Ziel im
E-Mail-Text.** Der Rich-Text-Editor der Outlook-"E-Mail senden
(V2)"-Aktion nimmt im Link-Einfügen-Dialog **keine Ausdrücke** entgegen —
ein dort eingetragener Ausdruck wie `body('Aktion')?['url']` wird als
wörtlicher Text ins `href`-Attribut geschrieben, nicht ausgewertet.
Ebenso funktioniert **kein direktes Einfügen von rohem HTML über die
Quellcode-Ansicht** (`</>`) — eingefügte spitze Klammern werden beim
Speichern escaped und erscheinen im Mailtext als sichtbarer Text
(`<p>...</p>`) statt als Formatierung. Zuverlässige Lösung: einen
eigenen Flow-Schritt (**Variable festlegen**) bauen, der den fertigen
`<a href="...">Text</a>`-Schnipsel per `concat(...)`-Ausdruck
zusammensetzt, und **diese Variable als Ganzes** über den
Dynamischer-Inhalt-Button (⚡) mitten in den normal getippten Fliestratext
einfügen — dynamisch eingefügte Werte werden nicht escaped, jeder direkt
eingetippte oder eingefügte HTML-Code hingegen schon.

## Unterweisung: PDF-Unterschriftenliste zusätzlich zur Rechnung (fertig, 06.09.2026)

Zusätzlich zur Rechnung wird bei Abschluss (alle Teilnehmer unterschrieben)
eine **PDF-Version der kompletten Unterschriftenliste** erzeugt und
mitverschickt — pro Teilnehmer Name, Vorname, Geburtsdatum, Status und die
eingescannte Unterschrift (Feld `Unterschrift`, Base64-PNG, aus
`Unterweisung_Teilnehmer`). **Fertig, end-to-end getestet (06.09.2026,
Testfirma "Testfracht Vilshofen GmbH").**

**Entschieden:**
- **Eine E-Mail mit zwei Anhängen** (Rechnung-PDF + Unterschriftenliste-PDF),
  keine zwei getrennten Mails.
- **CC an Daniel** auf dieser E-Mail (`danieleckmeier@prodrive-akademie.de`),
  damit er automatisch eine Kopie für Nachweiszwecke im eigenen Postfach hat.
- **Ablage NICHT in der Rechnungen-Bibliothek**, sondern in einer neuen
  Dokumentbibliothek/Ordner **"Unterschriftenlisten"** unter derselben
  Struktur wie "Fahrausweise"/"Zertifikate" — konkret: Bibliothek
  "Dokumente" auf Site **"Ausbildung Zentrale"** (nicht "ProDrive
  Verwaltung"!), Ordnerpfad `/Freigegebene Dokumente/Unterschriftenlisten`,
  Dateiname `Unterschriftenliste_<Rechnungsnummer>.pdf`.

**Umsetzung in `UNTERWEISUNG_SPEICHERN_URL`** (im Wahr-Zweig von "Buchung
noch offen", nach "Datei erstellen SharePoint Sammel", vor "E-Mail senden
Sammel"):
- **"Auf alle anwenden 1"** (For each über `body('Elemente_abrufen_1')?
  ['value']`, dieselbe bereits vorhandene Teilnehmerliste, die auch für
  die Kopfzahl verwendet wird) → darin **"Anfügen an Zeichenfolgenvariable"**
  (Append to string variable) auf `varUnterschriftenZeilen`, baut pro
  Teilnehmer eine `<tr>`-Zeile (Name, Vorname, Geburtsdatum, Status,
  `<img src="...">` mit der Unterschrift).
- **"Variable festlegen 6"** baut daraus `varUnterschriftenlisteHTML` —
  eine komplette HTML-Seite im selben Layout/Stil wie die Rechnung (Logo
  via `base64(body('Logo_laden_Sammel'))`, Farben/Typografie identisch zur
  Rechnungsvorlage).
- Danach wie bei der Rechnung: Datei erstellen (OneDrive, HTML) → Datei
  konvertieren (→PDF) → Datei erstellen (SharePoint, Ziel siehe oben).
- "E-Mail senden Sammel": CC-Feld gesetzt, zweiter Anhang mit dem
  konvertierten PDF hinzugefügt.

**Zwei Power-Automate-Fallstricke, die dabei aufgetreten sind (neu, wichtig
für künftige Array-zu-HTML-Umbauten):**
- **"Auswählen" (Select) im Zuordnung/Key-Value-Modus statt Text-Modus**
  liefert ein Array von Objekten mit leerem Schlüssel (`{"": "<Wert>"}`)
  statt eines Arrays reiner Strings. `join(...)` produziert daraus dann
  sichtbaren JSON-Müll (`{"":"..."}{"":"..."}`) im Ergebnistext, statt die
  Werte sauber zu verketten. Der "Text-Modus"-Umschalter für "Auswählen"
  ist in der Oberfläche schwer zu finden/zu treffen — **zuverlässiger
  Ersatz: eine "For each"-Schleife mit "Anfügen an Zeichenfolgenvariable"
  statt "Auswählen" + `join()`** verwenden, wenn aus einem Array eine
  einzelne HTML-Zeichenkette gebaut werden soll.
- **`Variable festlegen` unterstützt keine Selbstreferenz**
  (`varX = concat(variables('varX'), ...)` schlägt fehl mit
  `WorkflowRunActionInputsInvalidProperty` / "Self reference is not
  supported when updating the value of variable"). Für
  Anhänge-in-Schleife-Muster (String akkumulieren) immer die eigene
  Aktion **"Anfügen an Zeichenfolgenvariable"** (Append to string
  variable) verwenden, nicht "Variable festlegen" mit Selbstbezug.
- **Base64-Doppel-Präfix-Falle:** Das Feld `Unterschrift` enthält bereits
  die komplette Data-URL (`data:image/png;base64,...`, so wie sie vom
  Canvas im Browser kommt) — beim Einbauen in `<img src="...">` darf
  `data:image/png;base64,` **nicht nochmal** vorangestellt werden, sonst
  entsteht ein ungültiges doppeltes Präfix und das Bild bleibt leer, ohne
  Fehlermeldung.

## Terminanfragen: Mehrere Terminvorschläge statt einem festen Termin (06.09.2026, in Arbeit)

`termine.html` (Trainer-Ansicht "Offene Terminanfragen") hatte bisher nur
ein festes Von/Bis-Datumsfeld beim Bestätigen. Auf Wunsch umgebaut auf
**beliebig viele Terminvorschlags-Zeilen** (je Von/Bis, per "+ weiteren
Terminvorschlag" hinzufügbar/entfernbar) — Ziel: dem Anfragenden mehrere
Terminoptionen zur Auswahl anbieten statt einen fix gesetzten Termin.
Frontend-seitig fertig (sendet ein Array `terminvorschlaege` statt
`bestaetigter_termin`/`bestaetigter_termin_bis` an `TERMIN_ENTSCHEIDEN_URL`
— **Payload-Feldname im Flow `Anfragen_bestätigen` muss noch angepasst
werden**, aktuell erwartet der Flow vermutlich noch die alten Einzelfelder).

**Offener Punkt, noch nicht entschieden:** Bei der Jährlichen Unterweisung
soll der Bestätigungs-Mail-Link nicht wie bei den anderen Kursen direkt
zur verbindlichen Kursbuchung (`anmeldung.html`) führen, sondern zunächst
nur einen **Besichtigungstermin vor Ort** klarmachen — die eigentliche
Unterweisungsbuchung mit fester Teilnehmerliste folgt danach separat.
Wie der Kunde aus den Terminvorschlägen genau einen Besichtigungstermin
auswählt (Selbstbedienungsseite mit neuem Flow vs. einfache
E-Mail-Antwort), ist noch offen — Frage wurde gestellt, aber noch nicht
beantwortet.

## Unterweisung-Erstkontakt: Terminanfrage statt Angebots-Rechner (05.09.2026)

Für den ersten Kontakt einer Firma zur Jährlichen Unterweisung wird
bewusst **nicht** `angebot.html` (Preisrechner + direkter Buchungslink)
verwendet, sondern das bereits bestehende, generische
**Terminanfrage-System**:

- `termin-anfragen.html` — neue Kurs-Karte "Jährliche Unterweisung
  Flurförderzeuge" (nur Präsenz, kein Format-Dropdown, analog
  "Grundlagentraining"). Geschätzte Mitarbeiterzahl wird im bereits
  vorhandenen Notiz-Freitextfeld erfasst (Platzhaltertext ergänzt) — kein
  neues Feld nötig.
- Sendet weiterhin an den gemeinsamen `ANMELDUNG_URL`-Flow mit
  `anfrage_typ: 'Terminanfrage'`, `schulung_id: 'unterweisung'` — dieser
  Flow ist bereits kursunabhängig/generisch.
- `termine.html` (Trainer-Ansicht "Offene Terminanfragen") und die beiden
  zugehörigen Flows `Terminanfragen` (Liste abrufen) und
  `Anfragen_bestätigen` (Bestätigen/Ablehnen) sind **komplett generisch**
  (zeigen/verarbeiten nur das freie Textfeld "Schulung", keine
  Kurstyp-Verzweigung, keine automatische Anlage in
  `Staplerprufung_Master` o.ä.) — **keine Flow-Änderung nötig gewesen**.

Begründung: Bei der Unterweisung steht der Umfang (genaue
Mitarbeiterzahl, Ablauf) oft erst nach einer Vor-Ort-Besichtigung fest —
ein sofortiger Preis + direkter Buchungslink (wie bei Stufe1/2/LaSi über
`angebot.html`) wäre verfrüht. Die Terminanfrage führt stattdessen zu
einem bestätigten/abgelehnten Besichtigungstermin; die eigentliche
Buchung mit fester Teilnehmerliste läuft danach separat über
`anmeldung.html` (siehe oben).
