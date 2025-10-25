// ============================================
// GOOGLE APPS SCRIPT - BACKEND API V1
// Website Breeding Ayam Super - TANPA LOGIN
// ============================================

// 📝 INSTRUKSI SETUP:
// 1. Copy semua kode ini ke Google Apps Script editor
// 2. Ganti 'YOUR_SPREADSHEET_ID' di baris 15 dengan Spreadsheet ID Anda
// 3. Klik Save (💾)
// 4. Klik Deploy > New deployment
// 5. Pilih type: Web app
// 6. Execute as: Me
// 7. Who has access: Anyone
// 8. Deploy dan copy Web App URL

// ⚙️ KONFIGURASI - GANTI INI!
const SPREADSHEET_ID = '1tLUfMD_8gIrYQjbKg0JoFrVvUDhLShovfyV23ihwrNs';  // ← GANTI DENGAN ID SPREADSHEET ANDA!

// Helper: Get sheet by name
function getSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" tidak ditemukan! Pastikan nama sheet exact match (case sensitive). Sheets yang ada: ${ss.getSheets().map(s => s.getName()).join(', ')}`);
    }

    return sheet;
  } catch (error) {
    if (error.message.includes('perhaps it was deleted')) {
      throw new Error(`SPREADSHEET_ID salah atau tidak bisa diakses! Pastikan Anda sudah ganti 'YOUR_SPREADSHEET_ID' dengan ID spreadsheet Anda.`);
    }
    throw error;
  }
}

// Helper: Generate unique ID
function generateId() {
  return Utilities.getUuid();
}

// Helper: Get all data from sheet
function getAllData(sheetName) {
  const sheet = getSheet(sheetName);

  // Check if sheet is empty
  if (sheet.getLastRow() === 0) {
    return [];
  }

  const data = sheet.getDataRange().getValues();

  // Check if only header exists
  if (data.length === 1) {
    return [];
  }

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Helper: Add data to sheet
function addData(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => data[header] || '');
  sheet.appendRow(row);
  return data;
}

// Helper: Update data in sheet
function updateData(sheetName, id, data) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === id) {
      headers.forEach((header, index) => {
        if (data[header] !== undefined) {
          sheet.getRange(i + 1, index + 1).setValue(data[header]);
        }
      });
      return true;
    }
  }
  return false;
}

// Helper: Delete data from sheet
function deleteData(sheetName, id) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// Main handler for GET requests
function doGet(e) {
  const params = e.parameter || {};
  const path = params.path || '';
  const action = params.action || '';

  Logger.log('doGet called - path: ' + path + ', action: ' + action);

  try {
    // If action exists, handle CRUD operations via GET (for CORS workaround)
    if (action) {
      return handleAction(action, params);
    }

    // Otherwise, handle as read-only GET
    if (!path || path === '' || path === 'undefined') {
      return jsonResponse({
        success: false,
        error: 'Parameter "path" or "action" required'
      });
    }

    switch(path) {
      case 'ayam_induk':
        return jsonResponse({ success: true, data: getAllData('ayam_induk') });

      case 'breeding':
        return jsonResponse({ success: true, data: getAllData('breeding') });

      case 'ayam_anakan':
        let anakan = getAllData('ayam_anakan');
        if (params.breeding_id) {
          anakan = anakan.filter(item => item.breeding_id === params.breeding_id);
        }
        return jsonResponse({ success: true, data: anakan });

      default:
        return jsonResponse({
          success: false,
          error: 'Invalid path: "' + path + '"'
        });
    }
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Handle CRUD actions (for GET-based operations)
function handleAction(action, params) {
  Logger.log('handleAction: ' + action);

  // Parse data from JSON string if exists
  let data = params;
  if (params.data) {
    try {
      data = JSON.parse(params.data);
    } catch(e) {
      // If parse fails, use params directly
    }
  }

  switch(action) {
    // Ayam Induk CRUD
    case 'add_ayam_induk':
      const newInduk = {
        id: generateId(),
        kode: data.kode,
        jenis_kelamin: data.jenis_kelamin,
        ras: data.ras,
        warna: data.warna,
        tanggal_lahir: data.tanggal_lahir
      };
      addData('ayam_induk', newInduk);
      return jsonResponse({ success: true, data: newInduk });

    case 'update_ayam_induk':
      updateData('ayam_induk', data.id, data);
      return jsonResponse({ success: true });

    case 'delete_ayam_induk':
      deleteData('ayam_induk', data.id);
      return jsonResponse({ success: true });

    // Breeding CRUD
    case 'add_breeding':
      const newBreeding = {
        id: generateId(),
        pejantan_id: data.pejantan_id,
        betina_id: data.betina_id,
        tanggal_kawin: data.tanggal_kawin,
        tanggal_menetas: data.tanggal_menetas,
        jumlah_anakan: data.jumlah_anakan || 0
      };
      addData('breeding', newBreeding);
      return jsonResponse({ success: true, data: newBreeding });

    case 'update_breeding':
      updateData('breeding', data.id, data);
      return jsonResponse({ success: true });

    case 'delete_breeding':
      deleteData('breeding', data.id);
      return jsonResponse({ success: true });

    // Ayam Anakan CRUD
    case 'add_ayam_anakan':
      const newAnakan = {
        id: generateId(),
        breeding_id: data.breeding_id,
        kode: data.kode,
        jenis_kelamin: data.jenis_kelamin,
        warna: data.warna,
        status: data.status || 'Sehat'
      };
      addData('ayam_anakan', newAnakan);
      return jsonResponse({ success: true, data: newAnakan });

    case 'update_ayam_anakan':
      updateData('ayam_anakan', data.id, data);
      return jsonResponse({ success: true });

    case 'delete_ayam_anakan':
      deleteData('ayam_anakan', data.id);
      return jsonResponse({ success: true });

    default:
      return jsonResponse({ success: false, error: 'Invalid action: ' + action });
  }
}

// Handle OPTIONS request (CORS preflight)
// This is required for POST requests from browsers
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Main handler for POST requests
function doPost(e) {
  try {
    // Log for debugging
    Logger.log('doPost called');
    Logger.log('postData: ' + e.postData.contents);

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    Logger.log('action: ' + action);
    
    switch(action) {
      // Ayam Induk CRUD
      case 'add_ayam_induk':
        const newInduk = {
          id: generateId(),
          kode: data.kode,
          jenis_kelamin: data.jenis_kelamin,
          ras: data.ras,
          warna: data.warna,
          tanggal_lahir: data.tanggal_lahir
        };
        addData('ayam_induk', newInduk);
        return jsonResponse({ success: true, data: newInduk });
        
      case 'update_ayam_induk':
        updateData('ayam_induk', data.id, data);
        return jsonResponse({ success: true });
        
      case 'delete_ayam_induk':
        deleteData('ayam_induk', data.id);
        return jsonResponse({ success: true });
        
      // Breeding CRUD
      case 'add_breeding':
        const newBreeding = {
          id: generateId(),
          pejantan_id: data.pejantan_id,
          betina_id: data.betina_id,
          tanggal_kawin: data.tanggal_kawin,
          tanggal_menetas: data.tanggal_menetas,
          jumlah_anakan: data.jumlah_anakan || 0
        };
        addData('breeding', newBreeding);
        return jsonResponse({ success: true, data: newBreeding });
        
      case 'update_breeding':
        updateData('breeding', data.id, data);
        return jsonResponse({ success: true });
        
      case 'delete_breeding':
        deleteData('breeding', data.id);
        return jsonResponse({ success: true });
        
      // Ayam Anakan CRUD
      case 'add_ayam_anakan':
        const newAnakan = {
          id: generateId(),
          breeding_id: data.breeding_id,
          kode: data.kode,
          jenis_kelamin: data.jenis_kelamin,
          warna: data.warna,
          status: data.status || 'Sehat'
        };
        addData('ayam_anakan', newAnakan);
        return jsonResponse({ success: true, data: newAnakan });
        
      case 'update_ayam_anakan':
        updateData('ayam_anakan', data.id, data);
        return jsonResponse({ success: true });
        
      case 'delete_ayam_anakan':
        deleteData('ayam_anakan', data.id);
        return jsonResponse({ success: true });
        
      default:
        return jsonResponse({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Helper: Create JSON response
// Note: Google Apps Script automatically handles CORS when deployed as "Anyone" access
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
