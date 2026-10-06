const zlib = require('zlib');
const axios = require('axios');

const PU_ALPHA =
  '0123456789' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'abcdefghijklmnopqrstuvwxyz' +
  '-_';
const B64_ALPHA =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'abcdefghijklmnopqrstuvwxyz' +
  '0123456789' +
  '+/';

const SERVERS = [
  'http://www.plantuml.com/plantuml/img/',
  'https://www.plantuml.com/plantuml/img/',
  'http://www.plantuml.com/plantuml/png/',
];

/**
 * PlantUML's "deflate" text encoding: raw zlib-deflate the UTF-8 text,
 * base64-encode it, then map the standard base64 alphabet onto PlantUML's
 * own URL-safe alphabet. This mirrors the Python implementation exactly
 * (zlib.compress(...)[2:-4] strips the zlib header/trailer to get a raw
 * deflate stream, equivalent to using a raw deflate transform here).
 */
function encode(text) {
  const deflated = zlib.deflateRawSync(Buffer.from(text, 'utf-8'), { level: 9 });
  const b64 = deflated.toString('base64');
  let out = '';
  for (const ch of b64) {
    const idx = B64_ALPHA.indexOf(ch);
    out += idx === -1 ? '' : PU_ALPHA[idx];
  }
  return out;
}

async function renderDiagram(syntax) {
  const trimmed = syntax.trim();
  const full = trimmed.startsWith('@start') ? trimmed : `@startuml\n${trimmed}\n@enduml`;
  const encoded = encode(full);

  let lastError = 'No server tried';
  for (const server of SERVERS) {
    const url = server + encoded;
    try {
      const resp = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        validateStatus: () => true,
      });
      if (resp.status === 200) {
        const buf = Buffer.from(resp.data);
        if (buf.slice(0, 4).toString('hex') === '89504e47') {
          return buf; // valid PNG
        }
        return buf;
      }
      lastError = `HTTP ${resp.status} from ${server}`;
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        lastError = `Timeout on ${server}`;
      } else {
        lastError = `Connection error: ${err.message}`;
      }
    }
  }
  throw new Error(
    `PlantUML server unreachable. ${lastError}. Check your internet connection and try again.`
  );
}

module.exports = { renderDiagram, encode };
