---
sidebar_position: 2
---

# TLS 1.3

import {Details} from '@site/src/components/HomepageFeatures';

<Details time="low" hardware={false} implementation={"RZ-Betrieb"} refs={[{name: "BSI TLS 2.0.01 a & c", link: "https://bsi.bund.de"}, {name: "BSI TLS 201 a & c", link: "https://bsi.bund.de"}, {name: "BSI TLS 2.0.01", link: "https://bsi.bund.de"}, {name: "BSI TLS 2.0.01 a", link: "https://bsi.bund.de"}]} />

## Management Summary

Beim Datenaustausch zwischen OZG-Dienst, Bürgerinnen und Bürgern muss ein zeitgemäßer Schutz gegen Mitlesen und Veränderung gewährleistet werden. TLS 1.3 ist der aktuelle Standard für die performante, moderne und hochsichere Verschlüsselung der Daten während der Übertragung.

## Erläuterung für OZG-Dienstverantwortliche

IT-Sicherheit lebt von aktuellen Verschlüsselungsstandards wie TLS 1.3 (Transport Layer Security 1.3). Auch das BSI fordert diesen in seinem Mindeststandard. Trotz technischer Verfügbarkeit in den Produkten ist TLS 1.3 bisher nicht flächendeckend aktiviert. Durch den Einsatz von diesem hochsicheren Verschlüsselungsverfahren wird der Gefahr des Abhörens und Verfälschens von Kommunikation durch Dritte bestmöglich begegnet. Die Verwendung von TLS 1.3 ist bei  großen Internetangeboten gängige Praxis.
Auch die Kommunikation der Bürgerinnen und Bürger mit Ihrem OZG-Dienst sind entsprechend abzusichern.

## Technischer Umsetzungsansatz

Nahezu alle marktüblichen Webkomponenten unterstützen die Verwendung des TLS-Protokolls in der Version 1.3 schon seit einigen Jahren. In der Regel kann TLS 1.3 durch eine Konfigurationsanpassung in Loadbalancer, WAF, Reverse-Proxy, Webserver oder externen CDN aktiviert werden. Bei Verwendung von Deep Paket Inspection sollte auf die Kompatibilität von Architektur und Produkt geachtet werden. Neben TLS 1.3 sollte zusätzlich derzeit noch TLS in der Version 1.2 zur Abwärtskompatibilität angeboten werden. 
