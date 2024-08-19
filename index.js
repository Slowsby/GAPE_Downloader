import fs from 'fs';
import path from 'path'
import fetch from 'node-fetch';
import axios from 'axios'
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY;
//Correct format to download images "https://eol.jsc.nasa.gov/DatabaseImages/images.directory/images.filename"
const baseForm = "https://eol.jsc.nasa.gov/DatabaseImages/";


let args = process.argv.slice(2)
const expedition = String(args)
// Change expidition naming following the "Database Mission ID" : https://eol.jsc.nasa.gov/FAQ/default.htm#cameraMetadata_Mission
//const expedition = "ISS001"
// API DOCS : https://eol.jsc.nasa.gov/SearchPhotos/PhotosDatabaseAPI/#dtaf
const url = `https://eol.jsc.nasa.gov/SearchPhotos/PhotosDatabaseAPI/PhotosDatabaseAPI.pl?query=images|mission|eq|${expedition}|images|directory|not%20like|*small*|images|directory|not%20like|*lowres*|images|directory|not%20like|*registered*|images|directory|not%20like|*ReefBase*|images|directory|not%20like|*custom*|images|directory|not%20like|*EO*&return=images|directory|images|filename&key=${API_KEY}`;
//Consecutive images to download
const batch = 20;

const fetchImages = async () => {
    try {
        let firstIndex = 0;
        console.log(`Starting fetch request for ${expedition}`)
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Successfully fetched data for ${expedition}`);
        while (firstIndex < data.length) {
            const lastIndex = Math.min(firstIndex + batch, data.length);
            const toDownload = data.slice(firstIndex, lastIndex);
            
            // Waits for the completion of the promise before starting new batch
            await Promise.all(toDownload.map(async (el) => {
                await downloadImage(el);
            }));
            // Update the index for the next batch
            firstIndex = lastIndex;
        }
    } catch (error) {
        console.log(`Error fetching data for ${expedition}`, error.message)
    }
}

const downloadImage = async (el) => {
    return new Promise(async (resolve, reject) => {
    try {
        const filePath = path.resolve("GAPE", expedition, el['images.filename']);
        const tmpFilePath = filePath + '.tmp';

        // Check if the file already exists
        if (fs.existsSync(filePath)) {
            console.log(`File already exists: ${filePath}`);
            resolve()
            return;
        }
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const response = await axios({
            url: `${baseForm}${el['images.directory']}/${el['images.filename']}`, // replace with the actual image URL
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(tmpFilePath);
        response.data.pipe(writer);

        // Wait for the download to complete
        writer.on('finish', () => {
            // Rename the .tmp file to the final file name
            fs.renameSync(tmpFilePath, filePath);
            console.log(`Downloaded and saved ${filePath}`);
            resolve()
        });

        writer.on('error', (error) => {
            fs.unlinkSync(tmpFilePath); // Delete the .tmp file on error
            reject(error.message)
        });

    } catch (error) {
        reject(error.message)
    }
    })
}
fetchImages();