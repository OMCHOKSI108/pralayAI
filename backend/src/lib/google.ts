import { Readable } from "stream";
import { google, drive_v3, sheets_v4 } from "googleapis";

let driveClient: drive_v3.Drive | null = null;
let sheetsClient: sheets_v4.Sheets | null = null;

function googleAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const oauthRefreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (clientEmail && rawPrivateKey) {
    return new google.auth.JWT({
      email: clientEmail,
      key: rawPrivateKey.replace(/\\n/g, "\n"),
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets"
      ]
    });
  }

  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const oauth = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    oauth.setCredentials({ refresh_token: oauthRefreshToken });
    return oauth;
  }

  throw new Error(
    "Google auth is not configured. Provide service account credentials or OAuth client id, secret, and refresh token."
  );
}

export function drive() {
  if (!driveClient) {
    driveClient = google.drive({ version: "v3", auth: googleAuth() });
  }
  return driveClient;
}

export function sheets() {
  if (!sheetsClient) {
    sheetsClient = google.sheets({ version: "v4", auth: googleAuth() });
  }
  return sheetsClient;
}

export async function uploadToDrive(file: File, folderId: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const response = await drive().files.create({
    requestBody: {
      name: `${Date.now()}-${file.name}`,
      parents: [folderId]
    },
    media: {
      mimeType: file.type || "application/octet-stream",
      body: Readable.from(buffer)
    },
    fields: "id, webViewLink"
  });

  const id = response.data.id;
  if (!id) throw new Error("Google Drive upload did not return a file id");

  await drive().permissions.create({
    fileId: id,
    requestBody: {
      role: "reader",
      type: "anyone"
    }
  });

  const fileData = await drive().files.get({
    fileId: id,
    fields: "webViewLink"
  });

  return fileData.data.webViewLink || `https://drive.google.com/file/d/${id}/view`;
}

export async function appendSheetRow(sheetName: string, values: unknown[]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID is not configured");

  await sheets().spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values]
    }
  });
}

export async function updateSheetRowById(sheetName: string, id: string, values: unknown[]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID is not configured");

  const current = await sheets().spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A:Z`
  });

  const rows = current.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) {
    await appendSheetRow(sheetName, values);
    return;
  }

  await sheets().spreadsheets.values.update({
    spreadsheetId,
    range: `'${sheetName}'!A${rowIndex + 1}:Z${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values]
    }
  });
}

export const applicationSheetName = () =>
  process.env.GOOGLE_APPLICATIONS_SHEET || "Applications Index";

export const paymentsSheetName = () =>
  process.env.GOOGLE_PAYMENTS_SHEET || "Financial Audit";
