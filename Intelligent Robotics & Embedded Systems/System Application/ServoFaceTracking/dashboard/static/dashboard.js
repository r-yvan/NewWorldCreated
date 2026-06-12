const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- charts
const MAX_POINTS = 48;
const servoSeries = [];
const trackSeries = [];
const recogSeries = [];

const SVG_NS = "http://www.w3.org/2000/svg";

function pushSeries(arr, val) {
  arr.push(val);
  if (arr.length > MAX_POINTS) arr.shift();
}

function buildPath(values, w, h, min, max, smooth = true) {
  const n = values.length;
  if (n === 0) return { line: "", area: "" };
  const pad = 4;
  const span = max - min || 1;
  const stepX = n > 1 ? (w - pad * 2) / (n - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y];
  });

  let line = `M ${pts[0][0]},${pts[0][1]}`;
  if (smooth && n > 1) {
    for (let i = 1; i < n; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      line += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
  } else {
    for (let i = 1; i < n; i++) line += ` L ${pts[i][0]},${pts[i][1]}`;
  }
  const area = `${line} L ${pts[n - 1][0]},${h - pad} L ${pts[0][0]},${h - pad} Z`;
  return { line, area };
}

function renderAreaChart(elId, datasets) {
  const el = $(elId);
  if (!el) return;
  const w = el.clientWidth || 280;
  const h = el.clientHeight || 96;

  // shared scale across datasets
  let max = 0;
  datasets.forEach((d) => d.values.forEach((v) => (max = Math.max(max, v))));
  max = max <= 0 ? 1 : max * 1.15;
  const min = 0;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const defs = document.createElementNS(SVG_NS, "defs");
  datasets.forEach((d, i) => {
    const grad = document.createElementNS(SVG_NS, "linearGradient");
    const gid = `${elId}-grad-${i}`;
    grad.setAttribute("id", gid);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    const s0 = document.createElementNS(SVG_NS, "stop");
    s0.setAttribute("offset", "0%");
    s0.setAttribute("stop-color", d.color);
    s0.setAttribute("stop-opacity", d.fill ?? 0.42);
    const s1 = document.createElementNS(SVG_NS, "stop");
    s1.setAttribute("offset", "100%");
    s1.setAttribute("stop-color", d.color);
    s1.setAttribute("stop-opacity", 0);
    grad.appendChild(s0);
    grad.appendChild(s1);
    defs.appendChild(grad);
  });
  svg.appendChild(defs);

  // subtle baseline grid
  for (let g = 1; g <= 3; g++) {
    const y = (h / 4) * g;
    const ln = document.createElementNS(SVG_NS, "line");
    ln.setAttribute("x1", 0);
    ln.setAttribute("x2", w);
    ln.setAttribute("y1", y);
    ln.setAttribute("y2", y);
    ln.setAttribute("stroke", "#1d1d20");
    ln.setAttribute("stroke-width", "1");
    svg.appendChild(ln);
  }

  datasets.forEach((d, i) => {
    if (d.values.length === 0) return;
    const { line, area } = buildPath(d.values, w, h, min, max);
    const areaEl = document.createElementNS(SVG_NS, "path");
    areaEl.setAttribute("d", area);
    areaEl.setAttribute("fill", `url(#${elId}-grad-${i})`);
    svg.appendChild(areaEl);

    const lineEl = document.createElementNS(SVG_NS, "path");
    lineEl.setAttribute("d", line);
    lineEl.setAttribute("fill", "none");
    lineEl.setAttribute("stroke", d.color);
    lineEl.setAttribute("stroke-width", "2");
    lineEl.setAttribute("stroke-linejoin", "round");
    lineEl.setAttribute("stroke-linecap", "round");
    svg.appendChild(lineEl);

    // glowing head dot
    const n = d.values.length;
    const pad = 4;
    const stepX = n > 1 ? (w - pad * 2) / (n - 1) : 0;
    const span = max - min || 1;
    const lastV = d.values[n - 1];
    const cx = pad + (n - 1) * stepX;
    const cy = pad + (1 - (lastV - min) / span) * (h - pad * 2);
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);
    dot.setAttribute("r", "3");
    dot.setAttribute("fill", d.color);
    svg.appendChild(dot);
  });

  el.replaceChildren(svg);
}

let _errorShown = false;
function showLoadError(msg) {
  if (_errorShown) return;
  _errorShown = true;
  const banner = document.createElement("div");
  banner.id = "dashboard-error";
  banner.style.cssText =
    "position:fixed;top:0;left:0;right:0;background:#7f1d1d;color:#fff;padding:12px;text-align:center;z-index:9999;font-size:14px";
  banner.textContent = msg;
  document.body.prepend(banner);
}

function stateClass(state) {
  const s = (state || "IDLE").toLowerCase();
  if (s === "locked") return "locked";
  if (s === "searching") return "searching";
  if (s === "tracking") return "tracking";
  return "idle";
}

function pctAngle(angle, min, max) {
  return ((angle - min) / (max - min)) * 100;
}

function renderStatus(data) {
  const badge = $("state-badge");
  badge.className = `badge ${stateClass(data.state)}`;
  badge.querySelector(".badge-text").textContent = data.state || "IDLE";

  const mqtt = $("mqtt-badge");
  mqtt.className = `badge ${data.mqtt_connected ? "mqtt-on" : "mqtt-off"}`;
  mqtt.querySelector(".badge-text").textContent = data.mqtt_connected
    ? "MQTT OK"
    : "MQTT --";

  const min = data.servo_min ?? 0;
  const max = data.servo_max ?? 180;
  const angle = data.servo_angle ?? 90;
  const pct = pctAngle(angle, min, max);

  $("servo-needle").style.left = `${pct}%`;
  $("servo-marker").style.left = `${pct}%`;
  $("servo-angle").textContent = `${Math.round(angle)}°`;
  $("lock-name").textContent = data.lock_name || "—";
  $("face-count").textContent = data.face_count ?? 0;
  $("track-fps").textContent = (data.track_fps ?? 0).toFixed(1);
  $("recog-fps").textContent = (data.recog_fps ?? 0).toFixed(1);
  $("threshold").textContent = (data.threshold ?? 0).toFixed(2);
  $("enrolled").textContent = data.enrolled_count ?? 0;

  const lost = data.lost_for ?? 0;
  $("lost-for").textContent =
    data.state === "SEARCHING" || lost > 0 ? `${lost.toFixed(1)}s` : "—";

  const banner = $("search-banner");
  if (data.state === "SEARCHING" && data.lock_name) {
    banner.textContent = `SEARCHING: ${data.lock_name}`;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }

  const servoLog = $("servo-log");
  servoLog.innerHTML = "";
  (data.servo_history || []).slice(0, 12).forEach((e) => {
    const li = document.createElement("li");
    const moved = Math.abs(e.to_angle - e.from_angle) >= 1;
    li.className = moved ? "move" : "hold";
    const t = new Date(e.ts * 1000).toLocaleTimeString();
    li.textContent = moved
      ? `${t}  ${Math.round(e.from_angle)}° → ${Math.round(e.to_angle)}°  ${e.reason}`
      : `${t}  HOLD ${Math.round(e.from_angle)}°  ${e.reason}`;
    servoLog.appendChild(li);
  });

  const faceList = $("face-list");
  faceList.innerHTML = "";
  const faces = data.faces || [];
  if (faces.length === 0) {
    const li = document.createElement("li");
    li.className = "face-empty";
    li.style.borderLeft = "none";
    li.textContent = "No faces detected";
    faceList.appendChild(li);
  }
  const lockIco =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  faces.forEach((f) => {
    const li = document.createElement("li");
    li.className = f.locked ? "locked" : f.accepted ? "known" : "";
    const confPct = f.accepted ? Math.round(f.confidence * 100) : 0;
    li.innerHTML = `
      <div class="face-row">
        <span class="face-name">${f.locked ? lockIco : ""}${f.name} <span style="color:var(--muted-2);font-weight:400">#${f.track_id}</span></span>
        <span class="conf">${f.accepted ? confPct + "%" : "—"}</span>
      </div>
      <div class="conf-bar"><div class="conf-fill" style="width:${confPct}%"></div></div>`;
    faceList.appendChild(li);
  });

  // ----- charts -----
  pushSeries(servoSeries, angle);
  pushSeries(trackSeries, data.track_fps ?? 0);
  pushSeries(recogSeries, data.recog_fps ?? 0);

  $("servo-chart-cur").textContent = `${Math.round(angle)}°`;
  $("fps-chart-cur").textContent =
    `${(data.track_fps ?? 0).toFixed(1)} / ${(data.recog_fps ?? 0).toFixed(1)}`;

  renderAreaChart("servo-chart", [
    { values: servoSeries, color: "#a565f0", fill: 0.45 },
  ]);
  renderAreaChart("fps-chart", [
    { values: recogSeries, color: "#d8b4fe", fill: 0.22 },
    { values: trackSeries, color: "#a565f0", fill: 0.4 },
  ]);

  const sysLog = $("sys-log");
  sysLog.innerHTML = "";
  (data.logs || []).slice(0, 20).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    sysLog.appendChild(li);
  });
}

async function poll() {
  try {
    const res = await fetch("/api/status");
    if (res.ok) {
      renderStatus(await res.json());
      return;
    }
    showLoadError(`Dashboard API error: HTTP ${res.status}`);
  } catch (err) {
    showLoadError(
      "Cannot reach dashboard API — is track.py --dashboard still running?",
    );
  }
}

// Verify static assets loaded (404 CSS = broken layout)
(function checkAssets() {
  const sheets = [...document.styleSheets];
  const ok = sheets.some((s) => s.href && s.href.includes("dashboard.css"));
  if (!ok) {
    showLoadError("Dashboard CSS failed to load (check /static/dashboard.css)");
  }
})();

setInterval(poll, 400);
poll();
