import { SaveLeadPayload } from '../types';

export const postLeadToSheet = async (webhookUrl: string, payload: SaveLeadPayload): Promise<void> => {
  if (!webhookUrl || webhookUrl.includes('{{WEBHOOK_URL}}') || webhookUrl.includes('YOUR_WEBHOOK_URL')) {
    console.error('Webhook URL is not configured.');
    throw new Error('Webhook URL is not configured.');
  }

  try {
    // We use 'no-cors' mode because Google Apps Script webhooks often don't handle
    // CORS preflight requests (OPTIONS) properly. This sends a "simple" request
    // that doesn't trigger a preflight check. The response will be "opaque",
    // meaning we can't inspect its content, but we assume success if no network error is thrown.
    
    // Encapsulating the payload in a Blob can improve reliability across different
    // browser implementations, particularly on mobile devices.
    const dataBlob = new Blob([JSON.stringify(payload)], {
      type: 'text/plain;charset=utf-8',
    });

    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      body: dataBlob,
    });
  } catch (error) {
    console.error("Failed to POST to webhook", error);
    // This will catch network errors (e.g., app is offline).
    throw new Error('Failed to save lead due to a network error.');
  }
};