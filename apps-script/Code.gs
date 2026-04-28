const SPREADSHEET_ID = '1ZbP7qrkz2HY6ebYKfPkCOpUWePaBjCWqPUdUvooJUHA';
const SHEET_NAME     = 'memos';

function doGet(e) {
  const action = e.parameter.action || 'get';
  const sheet  = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

  try {
    if (action === 'get') {
      const userId = e.parameter.userId || '';
      const rows   = sheet.getDataRange().getValues();
      const memos  = [];

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]) === userId) {
          memos.push({
            id:         rows[i][0],
            user_id:    rows[i][1],
            content:    rows[i][2],
            created_at: rows[i][3]
          });
        }
      }

      memos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return ok(memos);
    }

    if (action === 'add') {
      const userId  = e.parameter.userId  || '';
      const content = e.parameter.content || '';
      if (!userId || !content) return ok({ error: 'userId와 content가 필요해요.' });

      const id        = Date.now();
      const createdAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      sheet.appendRow([id, userId, content, createdAt]);
      return ok({ success: true, id, created_at: createdAt });
    }

    if (action === 'delete') {
      const id   = e.parameter.id || '';
      const rows = sheet.getDataRange().getValues();

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) {
          sheet.deleteRow(i + 1);
          return ok({ success: true });
        }
      }
      return ok({ error: '해당 메모를 찾지 못했어요.' });
    }

    return ok({ error: '알 수 없는 action이에요.' });

  } catch (err) {
    return ok({ error: err.toString() });
  }
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
