import { Lead } from '../types';

/**
 * Saves a lead to a Google Sheet named 'PIPECARE_Leads'.
 * 
 * NOTE: This is a mock implementation. In a real-world application, this function
 * would make an HTTP POST request to a backend endpoint (e.g., a Google Cloud Function
 * or a Google Apps Script web app). That backend service would have the necessary 
 * authentication and authorization to append a row to the specified Google Sheet.
 * 
 * The frontend should not directly interact with the Google Sheets API for security reasons.
 * 
 * @param lead The lead data to save.
 * @returns A promise that resolves when the lead is saved successfully.
 */
export const saveLeadToSheet = async (lead: Lead): Promise<{ success: true }> => {
  console.log('Saving lead to Google Sheet (mock implementation):', lead);
  
  // Simulate network delay of an API call.
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation, you would handle potential errors from the backend 
  // and throw an error if the save operation fails.
  // For this mock, we always assume success.
  return { success: true };
};
