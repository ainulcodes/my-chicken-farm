// ============================================
// GOOGLE APPS SCRIPT - BACKEND API
// Website Breeding Ayam Super
// ============================================

// 📝 INSTRUKSI SETUP:
// 1. Copy semua kode ini ke Google Apps Script editor
// 2. Ganti 'YOUR_SPREADSHEET_ID' di baris 15 dengan Spreadsheet ID Anda
//    (ID ada di URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit)
// 3. Klik Save (💾)
// 4. Klik Deploy > New deployment
// 5. Pilih type: Web app
// 6. Execute as: Me
// 7. Who has access: Anyone
// 8. Deploy dan copy Web App URL

// ⚙️ KONFIGURASI - GANTI INI!
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';  // ← GANTI DENGAN ID SPREADSHEET ANDA!

// Helper: Get sheet by name
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

// Helper: Generate unique ID
function generateId() {
  return Utilities.getUuid();
}

// Helper: Get all data from sheet
function getAllData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
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
  const path = e.parameter.path || '';
  const userEmail = e.parameter.userEmail || '';
  
  try {
    switch(path) {
      case 'ayam_induk':
        const indukan = getAllData('ayam_induk').filter(item => item.pemilik_email === userEmail);
        return jsonResponse({ success: true, data: indukan });
        
      case 'breeding':
        const breeding = getAllData('breeding').filter(item => item.pemilik_email === userEmail);
        return jsonResponse({ success: true, data: breeding });
        
      case 'ayam_anakan':
        const breedingId = e.parameter.breeding_id;
        let anakan = getAllData('ayam_anakan').filter(item => item.pemilik_email === userEmail);
        if (breedingId) {
          anakan = anakan.filter(item => item.breeding_id === breedingId);
        }
        return jsonResponse({ success: true, data: anakan });
        
      default:
        return jsonResponse({ success: false, error: 'Invalid path' });
    }
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Main handler for POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const userEmail = data.userEmail || '';
    
    switch(action) {
      // User login/register
      case 'login':
        const existingUser = getAllData('users').find(u => u.email === data.email);
        if (!existingUser) {
          const newUser = {
            id: generateId(),
            email: data.email,
            display_name: data.display_name || '',
            photo_url: data.photo_url || '',
            uid: data.uid || '',
            created_at: new Date().toISOString()
          };
          addData('users', newUser);
          return jsonResponse({ success: true, data: newUser });
        }
        return jsonResponse({ success: true, data: existingUser });
        
      // Ayam Induk CRUD
      case 'add_ayam_induk':
        const newInduk = {
          id: generateId(),
          kode: data.kode,
          jenis_kelamin: data.jenis_kelamin,
          ras: data.ras,
          warna: data.warna,
          tanggal_lahir: data.tanggal_lahir,
          pemilik_email: userEmail
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
          jumlah_anakan: data.jumlah_anakan || 0,
          pemilik_email: userEmail
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
          status: data.status || 'Sehat',
          pemilik_email: userEmail
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
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Setup function - run once to set spreadsheet ID
function setup() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Setup', 'Enter your Spreadsheet ID:', ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() == ui.Button.OK) {
    const spreadsheetId = response.getResponseText();
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
    ui.alert('Setup complete! Spreadsheet ID saved.');
  }
}
