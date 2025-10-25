import { create } from 'qrcode';

const PIX_KEY_ID = '0014br.gov.bcb.pix';

function formatTLV(id: string, value: string) {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  const polinomio = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polinomio;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixStaticPayloadOptions {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
  description?: string;
}

export function buildPixPayload(options: PixStaticPayloadOptions) {
  const merchantAccountInformation = formatTLV('26', `${formatTLV('00', PIX_KEY_ID)}${formatTLV('01', options.pixKey)}${
    options.description ? formatTLV('02', options.description) : ''
  }`);

  const additionalDataFieldTemplate = formatTLV('62', formatTLV('05', options.txid));

  const amount = (options.amount / 100).toFixed(2);

  const base =
    formatTLV('00', '01') +
    formatTLV('01', '12') +
    formatTLV('26', merchantAccountInformation.slice(4)) +
    formatTLV('52', '0000') +
    formatTLV('53', '986') +
    formatTLV('54', amount) +
    formatTLV('58', 'BR') +
    formatTLV('59', options.merchantName.slice(0, 25)) +
    formatTLV('60', options.merchantCity.slice(0, 15)) +
    additionalDataFieldTemplate;

  const payload = `${base}6304`;
  const checksum = crc16(payload);
  return payload + checksum;
}

export async function payloadToSvg(payload: string) {
  const qr = create(payload, { type: 'svg', margin: 1, width: 256 });
  return qr.createSvgTag({ margin: 0, width: 256 });
}
