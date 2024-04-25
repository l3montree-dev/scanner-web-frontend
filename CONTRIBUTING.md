# Beitragen

## Code of Conduct

Das Projekt hat einen Verhaltenskodex ([Code of Conduct](CODE_OF_CONDUCT.md))
an den sich alle Mitwirkenden halten müssen.


## Direkte Mitwirkung

Wir freuen uns über Ihre Mitarbeit! Sie können sich aktiv, z. B. mit Änderungsvorschlägen (Merge Requests), Fragen oder Dokumentation hier in diesem Repository einbringen.


### Anwendungsfragen bzw. Vorschläge (Issues)

Wenn Sie Fragen zu diesem Projekt haben oder Vorschläge für Ihre Weiterentwicklung oder Anpassung machen möchten, ermutigen wir Sie, ein Issue in unserem Repository zu erstellen. Issues sind ein zentraler Bestandteil unseres Projekts, da sie es uns ermöglichen, offene Fragen zu diskutieren, Feedback zu sammeln und neue Ideen oder Verbesserungen zu erkunden.

#### Erstellen eines Issues

Um die Erstellung und Bearbeitung von Issues zu vereinfachen und zu standardisieren, haben wir spezifische Issue-Templates eingerichtet. Diese Templates helfen Ihnen, Ihre Fragen oder Vorschläge klar und strukturiert zu formulieren. Wir bitten Sie, das entsprechende Template für Ihre Anfrage auszuwählen:

- **Fehlerreport:** Wenn Sie Anwendungsfehler (Bugs) oder andere Fehler z. B. in der Dokumentation entdecken, verwenden Sie bitte unser [Fehlerreport-Template](https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/issues/new?issuable_template=bug).

- **Feature-Anfragen oder Verbesserungsvorschläge:** Für Vorschläge zur Erweiterung des Projekts oder zur Implementierung neuer Funktionen nutzen Sie bitte unser [Weiterentwicklungs-/Anpassungsanfrage-Template](https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/issues/new?issuable_template=feature).

Füllen Sie alle erforderlichen Felder des Templates aus. Je detaillierter Ihre Beschreibung, desto besser können wir auf Ihr Anliegen eingehen. Unsere Community oder unser Team wird sich das Issue ansehen und entsprechend darauf reagieren.

Wir schätzen Ihre Mitarbeit und Ihre Beiträge zur kontinuierlichen Verbesserung dieses Projekts!


### Konkrete Änderungsvorschläge: Feature Branch Workflow und Merge Requests

In diesem Projekt verwenden wir den sogenannten Feature Branch Workflow für alle Entwicklungen. Dieser Prozess sorgt dafür, dass der Quelltext des Projekts stabil bleibt und Änderungen schnell überprüft werden können. Auf jedem Feature Branch wird nur eine konkrete Neuerung bzw. Verbesserung bearbeitet. 

![](./assets/Branching.png)

Hier ist eine kurze Anleitung, wie Sie diesen Workflow nutzen können:

1. Erstellen eines Feature Branches: Bevor Sie mit der Arbeit an einem neuen Feature oder einer Korrektur beginnen, [erstellen Sie einen neuen Branch](https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/branches/new) ausgehend vom `main`-Branch. Benennen Sie Ihren Branch in einer Weise, die das Feature oder die Korrektur klar beschreibt (z. B. `feature/scan-dkim` oder `fix/http-timeout`).

2. Entwicklung in Ihrem Branch: Führen Sie Ihre Änderungen in Ihrem Feature Branch durch. Halten Sie Ihre Commits (sozusagen Speicherpunkte/ Änderungen) kleinschrittig und fokussiert, und stellen Sie sicher, dass jeder Commit eine logische Einheit der Arbeit darstellt. Beschreiben Sie Ihre Änderungen, welche Sie in dem jeweiligen Commit gemacht haben, kurz inhaltlich in der Commit-Message. 

3. Erstellen eines Merge Requests (MR): Sobald Sie bereit sind, Ihre Änderungen zur Überprüfung vorzustellen, erstellen Sie einen [Merge Request](https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/merge_requests/new) gegen den `main` Branch des Projekts. In Ihrem MR sollten Sie eine klare Beschreibung Ihrer Änderungen, den Zweck des Features oder der Korrektur und eventuell relevante Details oder Screenshots beifügen. Sie können auch schon frühzeitig einen MR erstellen, um Feedback zu Ihren Änderungen zu erhalten, während Sie noch daran arbeiten. In diesem Fall markieren Sie bitte Ihren MR als Entwurf (Draft).

4. Code Review und Diskussion: Andere Projektmitglieder werden Ihren Code überprüfen. Seien Sie offen für Feedback und Diskussionen.

5. Übernahme in den Hauptbranch: Nachdem Ihr MR genehmigt wurde, wird er in den `main` Branch übernommen. Dies bedeutet, dass Ihre Änderungen nun Teil des Hauptprojekts sind.

