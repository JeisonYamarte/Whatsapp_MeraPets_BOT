import path from 'path';
import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function addRowToSheets(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values],
        },
        auth,
    }

    try{
        const response = (await sheets.spreadsheets.values.append(request).data);
        return response;

    } catch (error) {
        console.error('Error adding row to Google Sheets:', error);
        throw error;
    }
}

const appendToSheets = async (data) =>{
    try{
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(),'src/credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })

        const authClient = await auth.getClient();
        const spreadsheetId = '1wezhMdnkdi4awJoLQ12W7Yh45lxBRc5kKoRJAZMUWQo';
        await addRowToSheets(authClient, spreadsheetId, data);
        return 'Row added successfully';

    } catch (error) {
        console.error('Error appending to Google Sheets:', error);
        throw error;
    }
}

export default appendToSheets;

