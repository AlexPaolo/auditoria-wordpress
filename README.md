# Sentinel · Panel de auditoría WordPress

Panel estático para revisar, en el navegador, datos demo e informes Nmap XML generados previamente. No necesita instalar dependencias, configurar PostgreSQL ni conectarse a una cuenta.

## Abrir el demo

Abre `index.html` en un navegador moderno. El panel carga tres informes ficticios con tendencias, hallazgos, activos y servicios; selecciona un informe en «Informes recientes» para cambiar los datos visibles. «Restaurar demo» descarta los informes importados durante esa sesión.

Los nombres de hosts, hallazgos y fechas del demo son datos ilustrativos; no representan una infraestructura real.

## Importar evidencia

1. Selecciona **Importar informe** y elige uno o más archivos Nmap XML previamente generados con autorización.
2. Los archivos se leen y analizan localmente en la pestaña; no se cargan a un servidor. Se admiten archivos de hasta 10 MB.
3. El inventario muestra hosts activos, sistema operativo reportado y puertos/servicios abiertos. Los hallazgos solo se extraen de scripts NSE cuyo identificador contiene `vuln` y cuyo resultado incluye explícitamente el estado `VULNERABLE`.
4. La severidad se muestra solo si el informe incluye un factor de riesgo, severidad o puntuación CVSS reconocible; en caso contrario aparece como «Sin clasificar».

Los puertos abiertos, versiones y servicios observados no se convierten por sí solos en vulnerabilidades. El panel no ejecuta Nmap, Metasploit ni módulos de explotación y no conserva los informes al cerrar o recargar la página. El historial de informes es solo de la sesión actual.

## Verificación rápida

En Windows PowerShell, desde la raíz del repositorio:

```powershell
node --check .\app.js
```

También se puede servir el contenido estático localmente con un servidor HTTP de desarrollo. No se requiere backend para la aplicación.
