// resumen-artillery.js
const fs = require("fs");

if (process.argv.length < 3) {
  console.error("Uso: node resumen-artillery.js archivo.json");
  process.exit(1);
}

const file = process.argv[2];
const raw = fs.readFileSync(file, "utf8");
const data = JSON.parse(raw);
const agg = data.aggregate;

// Contadores básicos
const reqs = agg.counters["http.requests"] || 0;
const ok = agg.counters["http.codes.200"] || 0;
const failed = agg.counters["vusers.failed"] || 0;
const rpsMean = agg.rates["http.request_rate"] || 0;

// Porcentaje de error
const errorPct = reqs > 0 ? ((failed / reqs) * 100).toFixed(2) : 0;

// Buscar tipo(s) de error
let errorTypes = [];
for (const key of Object.keys(agg.counters)) {
  if (key.startsWith("errors.")) {
    const type = key.replace("errors.", "");
    const count = agg.counters[key];
    errorTypes.push(`${type} (${count})`);
  }
}
if (errorTypes.length === 0) errorTypes.push("Ninguno");

// Latencias
const lat = agg.summaries["http.response_time"] || {};
const min = lat.min || 0;
const p50 = lat.p50 || 0;
const p95 = lat.p95 || 0;
const max = lat.max || 0;
const mean = lat.mean || 0;

// ==== SALIDA ====
console.log(`\n📊 Resumen de la prueba: ${file}`);
console.log("====================================");
console.log(`Total de Requests       : ${reqs}`);
console.log(`Respuestas 200 OK       : ${ok}`);
console.log(`Errores totales         : ${failed}`);
console.log(`% de error              : ${errorPct}%`);
console.log(`Tipo(s) de error        : ${errorTypes.join(", ")}`);
console.log(`RPS promedio            : ${rpsMean.toFixed(1)} req/s`);

console.log("\n⏱️ Latencias (ms – http.response_time)");
console.log(`  min   : ${min}`);
console.log(`  p50   : ${p50}`);
console.log(`  p95   : ${p95}`);
console.log(`  max   : ${max}`);
console.log(`  media : ${mean.toFixed(1)}`);

// CSV
console.log("\nCSV:");
console.log(
  "file,requests,ok,errors,errors_pct,error_types,rps_mean,lat_min,lat_p50,lat_p95,lat_max"
);
console.log(
  `${file},${reqs},${ok},${failed},${errorPct},"${errorTypes.join(
    " | "
  )}",${rpsMean},${min},${p50},${p95},${max}`
);
