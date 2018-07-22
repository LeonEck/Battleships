# Battleships

[![Build Status](https://travis-ci.org/LeonEck/Battleships.svg?branch=master)](https://travis-ci.org/LeonEck/Battleships)

Schiffe versenken als Web-Spiel.

## Installation

### Vorbereitung
#### Ubuntu oder OSX
Node Version Manager installieren:
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
source ~/.bashrc
nvm install 5.4
nvm use 5.4
```

#### Windows
Aktuelle Version von Node.js installieren: <https://nodejs.org/en/download/stable/>

### Battleships installieren
```
git clone https://github.com/LeonEck/Battleships.git
cd Battleships
npm install
```

Optional:
```
Tests laufen lassen: npm test
Dokumentation generieren: npm run doc
```

Starten:  
```
npm start
```
Die Seite ist nun über Port 8000 erreichbar <http://localhost:8000>

### Troubleshooting
[Ubuntu oder OSX] Wenn beim Ausführen von `npm` oder `node` der Fehler kommt, dass der Befehl nicht vorhanden ist, muss nochmal `nvm use 5.4` ausgeführt werden.

## Funktionale Anforderungen
1. Nutzer sollen auf der Startseite die Möglichkeit haben nach einem Spiel zu suchen.
2. Sobald mindestens 2 Nutzer nach einem Spiel suchen wird ein Spiel mit zwei Nutzern gestartet (Im Folgenden wird nicht mehr von "Nutzern" sondern von "Spielern" gesprochen).
3. Den Spielern wird jeweils ihr eigenes Spielfeld, sowie das des Gegners (soweit sie dieses bereits aufgedeckt haben) dargestellt.
4. Bevor die eigentliche Spielphase beginnt, kann jeder Spieler über einen Button ein zufälliges Spielfeld generieren lassen.
    * Schiffe:
        - 1 x 5 Felder
        - 2 x 4 Felder
        - 3 x 3 Felder
        - 4 x 2 Felder
    * Regeln beim Platzieren:
        - Schiffe dürfen sich nicht berühren
            + Definition: Es muss mindestens ein Feld zwischen zwei Schiffen frei sein, auch diagonal.
    * Quelle: [Wikipedia Schiffe versenken Vorbereitung](https://de.wikipedia.org/wiki/Schiffe_versenken#Vorbereitung)
5. Wenn beide Spieler ihr Spielfeld bestätigt haben beginnt die Spielphase.
6. Einer der Spieler wird zufällig ausgewählt und darf beginnen.
7. Die Spielphase verläuft nach folgenden Regeln:
    * Wenn ein Spieler kein Schiff trifft, ist der Gegner am Zug.
    * Wenn ein Schiff getroffen wurde ist der Spieler noch einmal dran.
    * Sobald ein Spieler ein Schiff des Gegners komplett zerstört hat, wird er darüber informiert.
8. Sobald einer der Spieler alle Schiffe des Gegners zerstört hat, hat dieser gewonnen.
    * Beide Spieler bekommen angezeigt ob sie gewonnen oder verloren haben und werden wieder auf die Startseite gebracht, wo sie nach einem neuen Spiel suchen können.

## Technische Basis

### Client
* Als Client wird eine Website verwendet.
* Verwendete Programmiersprachen:
    - JavaScript
    - (HTML) [Auszeichnungssprache]
    - (CSS) [Stylesheet-Sprache]
* Verwendete Frameworks:
    - JQuery
        + JavaScript Framework, dass unter anderem DOM-Manipulation und Event Handling vereinfacht.
    - Bootstrap
        + Wird verwendet um die Gestaltung der Seite zu vereinfachen und ein responsive Design zu ermöglichen.
* Begründung für die Wahl der Client Technologien:
    - Eine große Menge an Endgeräten kann ohne großen Aufwand unterstützt werden.
        + Die Webseite ist sowohl für Desktops als auch für Mobilgeräte optimiert.
    - Die Hürde für mögliche Nutzer, das Spiel auszuprobieren, ist sehr gering, da keine Software heruntergeladen werden muss.

### Datenübertragung
* Zur Datenübertagung werden Websockets verwendet.
* Begründung für die Wahl der Methode zur Datenübertragung:
    - Da ich keine Plugintechniken wie z.B. Flash einsetzen möchte, habe ich als native Kommunikationsmethoden im Browser primär nur HTTP-Requests und Websockets zur Auswahl.
    - Für den Anwendungsfall eines Spiels, in dem die Nutzer schnelle Reaktionen auf ihre Eingaben erwarten, empfehlen sich Websockets, da hierüber eine Kommunikation mit sehr geringer Latenz möglich ist. Außerdem müssen so die Clients nicht ständig am Server nachfragen ob es neue Daten gibt, sondern der Server kann von sich aus Daten an den Client schicken.

### Server
* Der Server ist in Node.js geschrieben.
* Verwendete Programmiersprachen:
    - JavaScript [ECMAScript 6](http://es6-features.org/)
* Verwendete Frameworks:
    - Express
        + Basis Web-Framework mit dem Beispielsweise dem Client die Website geschickt wird wenn er die Stamm-URL (/) aufruft.
    - Socket.IO
        + Framework für Websockets
* Begründung für die Wahl der Server Technologien:
    - Der Vorteil beim Einsatz von Node.js ist es, dass ich sowohl am Client, als auch am Server die gleiche Programmiersprache (JavaScript) nutzen kann, was die Entwicklung vereinfacht und beschleunigt.
    - Node.js bietet mit dem Framework Socket.IO eine sehr gute Implementierung von Websockets und ist durch seine asynchrone Arbeitsweise sehr gut für den Einsatz mit Clients die im Internet stehen geeignet, bei denen man sich nicht auf Antwortzeiten oder Erreichbarkeit verlassen kann.

### Entwicklung
* Für Abhängigkeiten des Servers wird der [Node Package Manager](https://www.npmjs.com/) verwendet.
    - Dieser wird über die Datei "package.json" konfiguriert und installiert alle Abhängigkeiten mit dem Befehl `npm install`.
* Für Abhängigkeiten des Clients verwende ich den Paketmanager [bower](http://bower.io/).
    - Dieser wird über die Datei "bower.json" konfiguriert.
    - Mit Hilfe des "scripts" Parameters innerhalb der "package.json" rufe ich den Befehl `bower install` automatisch auf, sobald `npm install` fertig ist.
* Um typische Arbeitsabläufe wie z.B. das Ausführen aller Tests zu erleichtern benutze ich den task runner [grunt](http://gruntjs.com/).
    - Dieser wird über die Datei "Gruntfile.js" konfiguriert und kann mit vielen Plugins erweitert werden.
    - Um die grunt Befehle direkt aufzurufen muss die grunt-cli global installiert werden: `npm install -g grunt-cli`
    - Unter anderem kann ich mit dem Befehl `grunt watch:test` dafür sorgen, dass "grunt" sobald sich eine Datei innerhalb meines Projektes geändert hat, automatisch alle Tests ausführt.
* Code Quality: Ich benutze das Tool [JSHint](http://jshint.com/) um einen konsistenten Stil in meinem Code zu pflegen und um mich auf offensichtliche Fehler hinzuweisen.
    - JSHint wird automatisch mit den Tests ausgeführt wenn man den Befehl `grunt test` aufruft.
    - JSHint erkennt z.B. wenn Variablen nicht in camelCase geschrieben sind oder Semikolons am Ende von Ausdrücken fehlen.
    - Die Regeln nach denen JSHint den Code scannt können in der Datei ".jshintrc" konfiguriert werden.
* Tests: Als Testframework benutze ich [Mocha](http://mochajs.org/).
    - Das Framework macht es sehr einfach asynchrone Events zu testen.
    - Als assertion library benutze ich [assert](https://www.npmjs.com/package/assert).
    - Alle Tests befinden sich im Ordner test/ und werden mit `grunt test` ausgeführt.
* Dokumentation: Zur automatischen Generierung der Codedokumentation benutze ich [JSDoc](https://github.com/jsdoc3/jsdoc).
    - Das Tool erkennt automatisch Klassen, Methoden usw. sowie die zugehörigen Kommentare und generiert daraus eine Dokumentation in HTML Form.
    - Generiert wird die Dokumentation mit dem Befehl `grunt doc` und befindet sich dann im Ordner doc/index.html
* Logging: Ich benutze die Library [winston](https://github.com/winstonjs/winston) um Logs zu verwalten.
    - Logmeldungen mit dem Level 'debug' werden nur auf der Konsole ausgegeben.
    - Alle anderen Meldungen werden auf die Konsole und in eine Datei ausgegeben.
        + Die Logs (sofern vorhanden) befinden sich im Ordner logs/


## Entwurf

## Teststrategie

* Allgemeine Regelungen zu Tests
    * Die Menge der Tests zu einem Fall sollte der der denkbaren praktischen Aufrufe und Rückgabewerte entsprechen.
    * Boolsche Werte bei Ein- und Ausgabe werden sowohl auf 'true' als auch 'false' getestet.
* Alle public Methoden die einen Returnwert haben werden mit mindestens einem Unit Test abgedeckt.
* Alle public Methoden die einen Seiteneffekt haben, der sich auf die aktuelle Anwendung beschränkt (beispielsweise keine Netzwerkkommunikation) und der über die Funktionalität einer Setter Methode hinausgeht bekommt mindestens einen Unit Test.
* Getter und Setter werden nicht getestet, solange sie trivial sind.
* Alle nach Außen zur Verfügung stehenden Schnittstellen (z. B. Websockets) werden in ihrer typischen Verwendung mit Integrationstests abgedeckt.
* Jede Methode die einen Seiteneffekt hat, der nicht über einen Unit Test abgedeckt wurde, sollte durch einen Integrationstest abgedeckt werden.
* Alle Methoden und Schnittstellen, die mit Nutzereingaben in Berührung kommen können, sollten mit nicht validen Eingaben getestet werden.
    * Es werden Fehlermeldungen oder keine Reaktionen erwartet.
    * Nicht zulässig sind zerstückelte Ausgaben oder Abstürze im Backend.
