const SPREADSHEET_ID = "1ex-n0Q8lpdvSpP0EMfL_ONhhPl6WpehnSPyo8rfvvm8";
const INQUIRIES_SHEET_NAME = "Inquiries";
const ORDERS_SHEET_NAME = "Orders";

const INQUIRY_HEADERS = [
  "Timestamp",
  "Name",
  "Contact",
  "Event Date",
  "Estimated Quantity",
  "Occasion",
  "Notes",
  "Source",
];

const ORDER_HEADERS = [
  "Timestamp",
  "Order ID",
  "Customer Name",
  "Phone",
  "LINE ID",
  "Pickup or Delivery Date",
  "Address",
  "Items",
  "Total",
  "Notes",
  "Source",
];

function doPost(e) {
  try {
    const payload = parsePayload(e);
    return routeRequest(payload);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function doGet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  return jsonResponse({
    ok: true,
    message: "Fortune Fruits endpoint is ready.",
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetUrl: spreadsheet.getUrl(),
    sheets: [INQUIRIES_SHEET_NAME, ORDERS_SHEET_NAME],
  });
}

function routeRequest(payload) {
  if (payload.type === "order") {
    return appendOrder(payload);
  }

  return appendInquiry(payload);
}

function appendInquiry(payload) {
  const sheet = getSheet(INQUIRIES_SHEET_NAME, INQUIRY_HEADERS);

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

  return successResponse("inquiry", sheet);
}

function appendOrder(payload) {
  const sheet = getSheet(ORDERS_SHEET_NAME, ORDER_HEADERS);
  const customer = payload.customer || {};

  sheet.appendRow([
    new Date(),
    payload.orderId || "",
    customer.customerName || "",
    customer.phone || "",
    customer.lineId || "",
    customer.deliveryDate || "",
    customer.address || "",
    formatItems(payload.items || []),
    payload.total || 0,
    customer.orderNotes || "",
    payload.source || "",
  ]);

  return successResponse("order", sheet);
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body.");
  }

  return JSON.parse(e.postData.contents);
}

function getSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

  ensureHeaders(sheet, headers);
  return sheet;
}

function ensureHeaders(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = headers.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function formatItems(items) {
  return items
    .map(function (item) {
      const subtotal = Number(item.price || 0) * Number(item.quantity || 0);
      return item.name + " x " + item.quantity + " = NT$ " + subtotal.toLocaleString("zh-TW");
    })
    .join("; ");
}

function successResponse(type, sheet) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  return jsonResponse({
    ok: true,
    type: type,
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetUrl: spreadsheet.getUrl(),
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
  });
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
