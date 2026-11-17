"use strict";

const severityConfig = [
  { key: "critical", label: "Crítica", color: "#e85d68" },
  { key: "high", label: "Alta", color: "#ef9250" },
  { key: "medium", label: "Media", color: "#efc84a" },
  { key: "low", label: "Baja", color: "#4ab89a" },
  { key: "unknown", label: "Sin clasificar", color: "#9aa6b8" }
];

const demoReports = [
  {
    id: "demo-2026-07",
    name: "auditoria-wordpress-julio.xml",
    date: "2026-07-12",
    assets: [
      { host: "web-01.demo.local", os: "Linux · detección estimada", services: ["443/tcp · https", "80/tcp · http", "22/tcp · ssh"] },
      { host: "db-01.demo.local", os: "Linux · detección estimada", services: ["5432/tcp · postgresql", "22/tcp · ssh"] },
      { host: "wp-stage.demo.local", os: "Sin identificar", services: ["443/tcp · https", "80/tcp · http"] }
    ],
    findings: [
      { title: "Plugin desactualizado detectado", cve: "CVE-2025-3102", host: "web-01.demo.local", service: "443/tcp · https", severity: "critical", evidence: "NSE reportó State: VULNERABLE; CVSS: 9.1." },
      { title: "Configuración TLS débil", cve: "", host: "web-01.demo.local", service: "443/tcp · https", severity: "high", evidence: "NSE reportó State: VULNERABLE; se observaron suites TLS heredadas." },
      { title: "Configuración del servicio vulnerable", cve: "", host: "db-01.demo.local", service: "5432/tcp · postgresql", severity: "medium", evidence: "NSE reportó State: VULNERABLE; validar configuración y parches." }
    ]
  },
  {
    id: "demo-2026-09",
    name: "revision-infra-septiembre.xml",
    date: "2026-09-18",
    assets: [
      { host: "web-01.demo.local", os: "Linux · detección estimada", services: ["443/tcp · https", "80/tcp · http", "22/tcp · ssh"] },
      { host: "db-01.demo.local", os: "Linux · detección estimada", services: ["5432/tcp · postgresql", "22/tcp · ssh"] },
      { host: "wp-stage.demo.local", os: "Sin identificar", services: ["443/tcp · https", "80/tcp · http"] }
    ],
    findings: [
      { title: "Plugin desactualizado detectado", cve: "CVE-2025-3102", host: "web-01.demo.local", service: "443/tcp · https", severity: "high", evidence: "NSE reportó State: VULNERABLE; CVSS: 7.4." },
      { title: "Configuración TLS débil", cve: "", host: "web-01.demo.local", service: "443/tcp · https", severity: "medium", evidence: "NSE reportó State: VULNERABLE; se observaron suites TLS heredadas." },
      { title: "Configuración del servicio vulnerable", cve: "", host: "db-01.demo.local", service: "5432/tcp · postgresql", severity: "low", evidence: "NSE reportó State: VULNERABLE; validar configuración y parches." }
    ]
  },
  {
    id: "demo-2026-11",
    name: "auditoria-wordpress-noviembre.xml",
    date: "2026-11-05",
    assets: [
      { host: "web-01.demo.local", os: "Linux · detección estimada", services: ["443/tcp · https", "80/tcp · http", "22/tcp · ssh"] },
      { host: "db-01.demo.local", os: "Linux · detección estimada", services: ["5432/tcp · postgresql", "22/tcp · ssh"] },
      { host: "wp-stage.demo.local", os: "Sin identificar", services: ["443/tcp · https", "80/tcp · http"] },
      { host: "monitor-01.demo.local", os: "Linux · detección estimada", services: ["443/tcp · https"] }
    ],
    findings: [
      { title: "Plugin desactualizado detectado", cve: "CVE-2025-3102", host: "web-01.demo.local", service: "443/tcp · https", severity: "high", evidence: "NSE reportó State: VULNERABLE; CVSS: 7.4." },
      { title: "Configuración TLS débil", cve: "", host: "wp-stage.demo.local", service: "443/tcp · https", severity: "medium", evidence: "NSE reportó State: VULNERABLE; se observaron suites TLS heredadas." },
      { title: "Configuración del servicio vulnerable", cve: "", host: "db-01.demo.local", service: "5432/tcp · postgresql", severity: "low", evidence: "NSE reportó State: VULNERABLE; validar configuración y parches." },
      { title: "Cabeceras HTTP incompletas", cve: "", host: "web-01.demo.local", service: "80/tcp · http", severity: "medium", evidence: "NSE reportó State: VULNERABLE; faltan cabeceras de seguridad." }
    ]
  }
];

let reports = copyDemoReports();
let selectedReportId = reports[reports.length - 1].id;
let severityFilter = "all";

function copyDemoReports() {
  return demoReports.map((report) => ({
    ...report,
    assets: report.assets.map((asset) => ({ ...asset, services: [...asset.services] })),
    findings: report.findings.map((finding) => ({ ...finding }))
  }));
}

function selectedReport() {
  return reports.find((report) => report.id === selectedReportId) || reports[reports.length - 1];
}

function textNode(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function severityName(key) {
  const item = severityConfig.find((severity) => severity.key === key);
  return item ? item.label : "Sin clasificar";
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value || "Fecha desconocida";
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function setStatus(message, isError) {
  const status = document.getElementById("status-message");
  status.textContent = message;
  status.classList.toggle("error", Boolean(isError));
}

function render() {
  const report = selectedReport();
  if (!report) return;
  renderMetrics(report);
  renderSeverity(report);
  renderTrend();
  renderServices(report);
  renderReports();
  renderFindings(report);
  renderAssets(report);
  document.getElementById("report-count").textContent = `${reports.length} ${reports.length === 1 ? "informe" : "informes"}`;
}

function renderMetrics(report) {
  const services = new Set(report.assets.flatMap((asset) => asset.services.map((service) => service.split(" · ")[0])));
  const priorities = report.findings.filter((finding) => finding.severity === "critical" || finding.severity === "high").length;
  document.getElementById("metric-assets").textContent = String(report.assets.length);
  document.getElementById("metric-findings").textContent = String(report.findings.length);
  document.getElementById("metric-priority").textContent = String(priorities);
  document.getElementById("metric-services").textContent = String(services.size);
  document.getElementById("metric-assets-note").textContent = `en ${report.assets.length === 1 ? "el" : "los"} activo${report.assets.length === 1 ? "" : "s"} del informe`;
  document.getElementById("metric-findings-note").textContent = report.findings.length === 0 ? "ningún hallazgo explícito" : "con evidencia explícita";
  document.getElementById("metric-priority-note").textContent = priorities === 0 ? "sin prioridad alta o crítica" : "requieren revisión";
  document.getElementById("metric-services-note").textContent = "puertos abiertos distintos";
}

function renderSeverity(report) {
  const totals = Object.fromEntries(severityConfig.map((item) => [item.key, 0]));
  report.findings.forEach((finding) => {
    const key = totals[finding.severity] === undefined ? "unknown" : finding.severity;
    totals[key] += 1;
  });
  const total = report.findings.length;
  document.getElementById("donut-total").textContent = String(total);
  const chart = document.getElementById("severity-chart");
  chart.setAttribute("aria-label", `Distribución de ${total} hallazgos por severidad`);
  if (total === 0) {
    chart.style.background = "conic-gradient(#edf0f5 0 100%)";
  } else {
    let start = 0;
    const segments = severityConfig.map((item) => {
      const end = start + (totals[item.key] / total) * 100;
      const segment = `${item.color} ${start}% ${end}%`;
      start = end;
      return segment;
    });
    chart.style.background = `conic-gradient(${segments.join(", ")})`;
  }
  const legend = document.getElementById("severity-legend");
  legend.replaceChildren();
  severityConfig.forEach((item) => {
    const row = document.createElement("div");
    row.className = "legend-item";
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.backgroundColor = item.color;
    dot.setAttribute("aria-hidden", "true");
    row.append(dot, textNode("span", item.label));
    const value = textNode("strong", String(totals[item.key]));
    row.append(value);
    legend.append(row);
  });
}

function renderTrend() {
  const container = document.getElementById("trend-chart");
  container.replaceChildren();
  if (reports.length === 0) {
    container.append(textNode("p", "Importa un informe para iniciar el historial.", "empty-state"));
    return;
  }
  const ordered = [...reports].sort((a, b) => a.date.localeCompare(b.date));
  const width = 620;
  const height = 145;
  const pad = { top: 12, right: 12, bottom: 25, left: 27 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const max = Math.max(4, ...ordered.map((report) => report.findings.length));
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("preserveAspectRatio", "none");
  const defs = document.createElementNS(svg.namespaceURI, "defs");
  const gradient = document.createElementNS(svg.namespaceURI, "linearGradient");
  gradient.setAttribute("id", "trend-fill");
  gradient.setAttribute("x1", "0");
  gradient.setAttribute("x2", "0");
  gradient.setAttribute("y1", "0");
  gradient.setAttribute("y2", "1");
  const stop1 = document.createElementNS(svg.namespaceURI, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#7194f4");
  stop1.setAttribute("stop-opacity", ".20");
  const stop2 = document.createElementNS(svg.namespaceURI, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#7194f4");
  stop2.setAttribute("stop-opacity", "0");
  gradient.append(stop1, stop2);
  defs.append(gradient);
  svg.append(defs);

  [0, 0.5, 1].forEach((ratio) => {
    const y = pad.top + plotHeight * ratio;
    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", String(pad.left));
    line.setAttribute("x2", String(width - pad.right));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("class", "chart-gridline");
    svg.append(line);
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", "0");
    label.setAttribute("y", String(y + 3));
    label.setAttribute("class", "chart-axis-label");
    label.textContent = String(Math.round(max * (1 - ratio)));
    svg.append(label);
  });
  const points = ordered.map((item, index) => {
    const x = ordered.length === 1 ? pad.left + plotWidth / 2 : pad.left + (index / (ordered.length - 1)) * plotWidth;
    const y = pad.top + plotHeight - (item.findings.length / max) * plotHeight;
    return { x, y, item };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${pad.top + plotHeight} L${points[0].x},${pad.top + plotHeight} Z`;
  const area = document.createElementNS(svg.namespaceURI, "path");
  area.setAttribute("d", areaPath);
  area.setAttribute("class", "trend-area");
  svg.append(area);
  const line = document.createElementNS(svg.namespaceURI, "path");
  line.setAttribute("d", linePath);
  line.setAttribute("class", "trend-line");
  svg.append(line);
  points.forEach((point) => {
    const circle = document.createElementNS(svg.namespaceURI, "circle");
    circle.setAttribute("cx", String(point.x));
    circle.setAttribute("cy", String(point.y));
    circle.setAttribute("r", "3.5");
    circle.setAttribute("class", "trend-point");
    circle.setAttribute("aria-label", `${formatDate(point.item.date)}: ${point.item.findings.length} hallazgos`);
    svg.append(circle);
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", String(point.x));
    label.setAttribute("y", String(height - 6));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "chart-axis-label");
    label.textContent = shortDate(point.item.date);
    svg.append(label);
  });
  container.append(svg);
}

function shortDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es", { month: "short", year: "2-digit" }).format(date);
}

function renderServices(report) {
  const counts = new Map();
  report.assets.forEach((asset) => asset.services.forEach((service) => {
    const name = service.split(" · ").slice(-1)[0] || service;
    counts.set(name, (counts.get(name) || 0) + 1);
  }));
  const container = document.getElementById("services-chart");
  container.replaceChildren();
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (rows.length === 0) {
    container.append(textNode("p", "No hay servicios abiertos en este informe.", "empty-state"));
    return;
  }
  const maximum = rows[0][1];
  rows.forEach(([name, count]) => {
    const row = document.createElement("div");
    row.className = "service-row";
    row.append(textNode("span", name, "service-name"));
    const track = document.createElement("span");
    track.className = "service-track";
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", `${name}: presente en ${count} activos`);
    const fill = document.createElement("span");
    fill.className = "service-fill";
    fill.style.display = "block";
    fill.style.width = `${Math.max(4, (count / maximum) * 100)}%`;
    track.append(fill);
    row.append(track, textNode("span", String(count), "service-count"));
    container.append(row);
  });
}

function renderReports() {
  const container = document.getElementById("reports-list");
  container.replaceChildren();
  [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).forEach((report) => {
    const row = document.createElement("div");
    row.className = `report-row${report.id === selectedReportId ? " selected" : ""}`;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-pressed", String(report.id === selectedReportId));
    row.setAttribute("aria-label", `Ver ${report.name}, ${report.findings.length} hallazgos`);
    const icon = textNode("span", "▤", "report-file-icon");
    icon.setAttribute("aria-hidden", "true");
    const details = document.createElement("span");
    details.append(textNode("span", report.name, "report-name"), textNode("span", formatDate(report.date), "report-date"));
    row.append(icon, details, textNode("span", `${report.findings.length} hallazgos`, "report-meta"));
    row.addEventListener("click", () => selectReport(report.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectReport(report.id);
      }
    });
    container.append(row);
  });
}

function selectReport(id) {
  selectedReportId = id;
  render();
}

function renderFindings(report) {
  const table = document.getElementById("findings-table");
  table.replaceChildren();
  const findings = report.findings.filter((finding) => severityFilter === "all" || finding.severity === severityFilter);
  document.getElementById("findings-empty").hidden = findings.length > 0;
  findings.forEach((finding) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    titleCell.append(textNode("span", finding.title, "finding-name"));
    if (finding.cve) titleCell.append(textNode("span", finding.cve, "finding-cve"));
    row.append(titleCell, textNode("td", finding.host, "asset-cell"), textNode("td", finding.service));
    const severityCell = document.createElement("td");
    severityCell.append(textNode("span", severityName(finding.severity), `severity-badge ${finding.severity || "unknown"}`));
    row.append(severityCell, textNode("td", finding.evidence, "evidence-cell"));
    table.append(row);
  });
}

function renderAssets(report) {
  const table = document.getElementById("assets-table");
  table.replaceChildren();
  document.getElementById("asset-total").textContent = `${report.assets.length} ${report.assets.length === 1 ? "activo" : "activos"}`;
  document.getElementById("assets-empty").hidden = report.assets.length > 0;
  report.assets.forEach((asset) => {
    const row = document.createElement("tr");
    const hostCell = document.createElement("td");
    const host = textNode("span", asset.host, "asset-cell");
    const dot = document.createElement("i");
    dot.className = "asset-dot";
    dot.setAttribute("aria-hidden", "true");
    host.prepend(dot);
    hostCell.append(host);
    const serviceNames = asset.services.map((service) => service.split(" · ").slice(-1)[0]);
    const ports = asset.services.map((service) => service.split(" · ")[0]).join(", ");
    row.append(hostCell, textNode("td", asset.os || "Sin identificar"), textNode("td", serviceNames.join(", ") || "Sin servicios abiertos"), textNode("td", ports || "—"));
    table.append(row);
  });
}

function parseSeverity(script) {
  const keyedValues = [...script.querySelectorAll("elem[key], table[key]")].map((element) => ({
    key: (element.getAttribute("key") || "").toLowerCase(),
    value: element.textContent.trim()
  }));
  const explicit = keyedValues.find((item) => ["risk_factor", "severity", "risk"].includes(item.key));
  const text = `${explicit ? explicit.value : ""}\n${script.getAttribute("output") || script.textContent}`;
  const risk = text.match(/(?:risk factor|severity|risk)\s*:\s*(critical|high|medium|moderate|low|informational|info)/i);
  if (risk) return normalizeSeverity(risk[1]);
  const cvss = text.match(/(?:cvss(?:\s*v?[23](?:\.\d)?)?)\s*[:=]?\s*([0-9](?:\.\d+)?)/i);
  if (cvss) {
    const score = Number(cvss[1]);
    if (score >= 9) return "critical";
    if (score >= 7) return "high";
    if (score >= 4) return "medium";
    if (score > 0) return "low";
  }
  return "unknown";
}

function normalizeSeverity(value) {
  const normalized = value.toLowerCase();
  if (normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "medium" || normalized === "moderate") return "medium";
  if (normalized === "low") return "low";
  return "unknown";
}

function parseVulnerabilityScripts(root, host, portLabel, serviceLabel, selector = "script") {
  return [...root.querySelectorAll(selector)].filter((script) => /vuln/i.test(script.getAttribute("id") || "")).flatMap((script) => {
    const output = `${script.getAttribute("output") || ""}\n${script.textContent || ""}`.trim();
    const explicitState = [...script.querySelectorAll('elem[key="state"], elem[key="State"]')]
      .some((element) => /^\s*VULNERABLE\b/i.test(element.textContent));
    const explicitOutput = /(?:^|\n)\s*State\s*:\s*VULNERABLE\b|(?:^|\n)\s*VULNERABLE\s*:/i.test(output);
    if (!explicitState && !explicitOutput) return [];
    const id = script.getAttribute("id") || "script-vuln";
    const cveMatch = `${id}\n${output}`.match(/CVE-\d{4}-\d{4,}/i);
    const conciseEvidence = output.replace(/\s+/g, " ").slice(0, 260) || "El script reportó el estado VULNERABLE.";
    return [{
      title: id.replace(/^http-/, "").replace(/[-_]+/g, " "),
      cve: cveMatch ? cveMatch[0].toUpperCase() : "",
      host,
      service: serviceLabel || portLabel || "Servicio no especificado",
      severity: parseSeverity(script),
      evidence: conciseEvidence
    }];
  });
}

function parseNmapXml(xmlText, fileName) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xmlText)) throw new Error("El informe contiene una declaración XML no admitida.");
  const documentXml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (documentXml.querySelector("parsererror") || documentXml.documentElement.tagName !== "nmaprun") {
    throw new Error("El archivo no parece ser un informe Nmap XML válido.");
  }
  const assets = [];
  const findings = [];
  documentXml.querySelectorAll("host").forEach((hostElement) => {
    if (hostElement.querySelector("status")?.getAttribute("state") === "down") return;
    const address = hostElement.querySelector("address")?.getAttribute("addr") || "Activo sin dirección";
    const hostname = hostElement.querySelector("hostnames hostname")?.getAttribute("name");
    const host = hostname || address;
    const os = hostElement.querySelector("osmatch")?.getAttribute("name") || "Sin identificar";
    const services = [];
    hostElement.querySelectorAll("port").forEach((port) => {
      const state = port.querySelector("state")?.getAttribute("state");
      if (state !== "open") return;
      const number = port.getAttribute("portid") || "?";
      const protocol = port.getAttribute("protocol") || "tcp";
      const serviceElement = port.querySelector("service");
      const serviceName = serviceElement?.getAttribute("name") || "desconocido";
      const product = serviceElement?.getAttribute("product");
      const version = serviceElement?.getAttribute("version");
      const serviceLabel = `${number}/${protocol} · ${serviceName}${product ? ` ${product}` : ""}${version ? ` ${version}` : ""}`;
      const portLabel = `${number}/${protocol}`;
      services.push(serviceLabel);
      findings.push(...parseVulnerabilityScripts(port, host, portLabel, serviceLabel));
    });
    findings.push(...parseVulnerabilityScripts(hostElement, host, "", "", "hostscript > script"));
    assets.push({ host, os, services });
  });
  if (assets.length === 0) throw new Error("El informe no contiene hosts disponibles para mostrar.");
  const start = Number(documentXml.documentElement.getAttribute("start"));
  const date = Number.isFinite(start) && start > 0
    ? new Date(start * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  return { id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: fileName, date, assets, findings };
}

async function importFiles(files) {
  const input = document.getElementById("report-files");
  const accepted = [...files];
  if (accepted.length === 0) return;
  const maxFileSize = 10 * 1024 * 1024;
  const imported = [];
  const errors = [];
  for (const file of accepted) {
    if (file.size > maxFileSize) {
      errors.push(`${file.name}: supera el límite de 10 MB.`);
      continue;
    }
    try {
      imported.push(parseNmapXml(await file.text(), file.name));
    } catch (error) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }
  if (imported.length > 0) {
    reports = [...reports, ...imported];
    selectedReportId = imported[imported.length - 1].id;
    render();
  }
  if (errors.length > 0) setStatus(errors.join(" "), true);
  else setStatus(`${imported.length} ${imported.length === 1 ? "informe importado" : "informes importados"} localmente.`, false);
  input.value = "";
}

document.getElementById("report-files").addEventListener("change", (event) => {
  importFiles(event.target.files);
});

document.getElementById("load-demo").addEventListener("click", () => {
  reports = copyDemoReports();
  selectedReportId = reports[reports.length - 1].id;
  severityFilter = "all";
  document.getElementById("severity-filter").value = "all";
  setStatus("Datos demo restaurados.", false);
  render();
});

document.getElementById("severity-filter").addEventListener("change", (event) => {
  severityFilter = event.target.value;
  renderFindings(selectedReport());
});

render();
