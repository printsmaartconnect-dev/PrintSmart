const fs = require("fs");
const path = require("path");

let didYouKnowCache = [];
let astrologyCache = [];

/**
 * A helper to parse a CSV line, respecting double quotes and escaped quotes.
 */
function parseCSVRow(text) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * A helper to parse CSV contents into an array of objects.
 */
function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0 || !lines[0].trim()) return [];
  const headers = parseCSVRow(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVRow(line);
    // Sometimes values length might be slightly different; align with headers
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    records.push(record);
  }
  return records;
}

/**
 * Load CSV files into memory cache
 */
function loadCSVFiles() {
  const csvDir = path.join(__dirname, "..", "assets", "csv");
  const didYouKnowPath = path.join(csvDir, "did_you_know.csv");
  const astrologyPath = path.join(csvDir, "astrology.csv");

  try {
    if (fs.existsSync(didYouKnowPath)) {
      const content = fs.readFileSync(didYouKnowPath, "utf8");
      didYouKnowCache = parseCSV(content);
      console.log(`Loaded ${didYouKnowCache.length} records from did_you_know.csv`);
    } else {
      console.warn("did_you_know.csv not found at", didYouKnowPath);
    }
  } catch (err) {
    console.error("Error loading did_you_know.csv:", err);
  }

  try {
    if (fs.existsSync(astrologyPath)) {
      const content = fs.readFileSync(astrologyPath, "utf8");
      astrologyCache = parseCSV(content);
      console.log(`Loaded ${astrologyCache.length} records from astrology.csv`);
    } else {
      console.warn("astrology.csv not found at", astrologyPath);
    }
  } catch (err) {
    console.error("Error loading astrology.csv:", err);
  }
}

/**
 * Get random entry from Did You Know cache
 */
function getRandomDidYouKnow() {
  if (didYouKnowCache.length === 0) {
    loadCSVFiles();
  }
  if (didYouKnowCache.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * didYouKnowCache.length);
  return didYouKnowCache[randomIndex];
}

/**
 * Get random entry from Astrology cache
 */
function getRandomAstrology() {
  if (astrologyCache.length === 0) {
    loadCSVFiles();
  }
  if (astrologyCache.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * astrologyCache.length);
  return astrologyCache[randomIndex];
}

module.exports = {
  loadCSVFiles,
  getRandomDidYouKnow,
  getRandomAstrology
};
