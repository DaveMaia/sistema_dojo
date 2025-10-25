const publicUrl = process.env.PUBLIC_WEBHOOK_URL || 'https://example.ngrok.dev/api/pix/webhook';
const secret = process.env.WEBHOOK_SECRET || 'defina_WEBHOOK_SECRET';

console.log('=== Sandbox de Webhook PIX ===');
console.log(`URL pública configurada: ${publicUrl}`);
console.log(`Header de assinatura esperado: Authorization: Bearer ${secret}`);
console.log('Use o comando abaixo para testar via curl:');
console.log(`curl -XPOST ${publicUrl} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${secret}" \\\n  -d '{"event_id":"evt_demo","provider_charge_id":"mock-123","amount":1000,"status":"PAID","txid":"MCK123"}'`);
