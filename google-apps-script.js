const SPREADSHEET_ID = "1ex-n0Q8lpdvSpP0EMfL_ONhhPl6WpehnSPyo8rfvvm8";
const SHEET_NAME = "Inquiries";

const HEADERS = [
  "Timestamp",
  "Name",
  "Contact",
  "Event Date",
  "Estimated Quantity",
  "Occasion",
  "Notes",
  "Source",
];

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const sheet = getInquirySheet();

    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.contact || "",
      payload.eventDate || "",
      payload.quantity || "",
      payload.occasion || "",
      payload.notes || "",
      payload.source || "",
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Fortune Fruits inquiry endpoint is ready.",
  });
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body.");
  }

  return JSON.parse(e.postData.contents);
}

function getInquirySheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
