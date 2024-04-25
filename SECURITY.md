# Sicherheitspolitik

## Versionen

Die neuesten Patches und die aktuellste Software werden auf dem Tag `:unstable` des Container-Images veröffentlicht. Aus diesem Grund werden die neuesten Sicherheitsupdates zuerst auf diesem rollierenden Tag veröffentlicht. Für den produktiven Einsatz gibt es regelmäßig einen Patch oder eine kleinere Version mit einem versionierten Container-Image-Tag. 

Ältere Tags müssen manuell aktualisiert werden, da wir normalerweise kein aktualisiertes Image für ein bestehendes Tag veröffentlichen; dies wird nur im Falle von _schweren_ Sicherheitslücken gemacht.

| Image Tags      | Latest Packages & Patches |
|-----------------|:-------------------------:|
| `:unstable`     | :white_check_mark:        |
| not `:unstable` | :x:                       |


## Melden einer Sicherheitslücke

Sie können eine Schwachstelle oder Anomalie an das Entwicklungsteam melden. Dadurch wird das Verfahren der koordinierten Offenlegung von Sicherheitslücken eingeleitet. Das Team wird sich dann bemühen, wenn möglich innerhalb einer Woche Sicherheitspatches zu entwickeln. Die Schwachstelle wird dann im Zuge der Veröffentlichung bekannt gemacht. Wenn Sie es wünschen, können Sie auch als Reporter veröffentlicht werden.

*Text based on: [DMS](https://github.com/docker-mailserver/docker-mailserver/blob/master/SECURITY.md)*