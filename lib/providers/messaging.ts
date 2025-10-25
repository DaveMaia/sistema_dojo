export interface MessagingPayload {
  to: string;
  template: string;
  variables?: Record<string, string>;
}

export interface MessagingProvider {
  send(payload: MessagingPayload): Promise<{ id: string }>;
}

class MockMessagingProvider implements MessagingProvider {
  async send(payload: MessagingPayload): Promise<{ id: string }> {
    console.log('Mock WhatsApp send', payload);
    return { id: `mock-${Date.now()}` };
  }
}

let provider: MessagingProvider | null = null;

export function getMessagingProvider(): MessagingProvider {
  if (!provider) {
    provider = new MockMessagingProvider();
  }
  return provider;
}
