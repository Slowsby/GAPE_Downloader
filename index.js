import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY;
const baseForm = "https://eol.jsc.nasa.gov/DatabaseImages/";
// Number of images downloaded at a time
const batch = 20;

// Puts CLI args in variables
const [arg, expedition, startRange, endRange] = process.argv.slice(2);

const fetchImages = async (url) => {
  try {
    let firstIndex = 0;
    console.log(`Fetching data (Can take a few secs for large databases)`);
    const response = await fetch(url);
    const data = await response.json();
    if (
      data.result === "SQL found no records that match the specified criteria"
    ) {
      throw new Error("No records found that match the specified criteria");
    }
    console.log(
      `Data fetched\nQueried: ${data.length} images\nStaring download...`,
    );
    while (firstIndex < data.length) {
      const lastIndex = Math.min(firstIndex + batch, data.length);
      const toDownload = data.slice(firstIndex, lastIndex);

      // Waits for the completion of the promise before starting new batch
      await Promise.all(
        toDownload.map(async (el) => {
          await downloadImage(el);
        }),
      );
      // Update the index for the next batch
      firstIndex = lastIndex;
    }
    console.log("Downloaded.");
  } catch (error) {
    console.log(`Error fetching data for ${expedition}`, error.message);
  }
};

// Changes the fetch URL based on the command used.
if (arg === "start") {
  console.log(`This will download the entire ${expedition} database`);
  // API DOCS : https://eol.jsc.nasa.gov/SearchPhotos/PhotosDatabaseAPI/#dtaf
  const url = `https://eol.jsc.nasa.gov/SearchPhotos/PhotosDatabaseAPI/PhotosDatabaseAPI.pl?query=images|mission|eq|${expedition}|images|directory|not%20like|*small*|images|directory|not%20like|*lowres*|images|directory|not%20like|*custom*|images|directory|not%20like|*EO*|images|directory|not%20like|*city*|images|directory|not%20like|*EFS*&return=images|directory|images|filename&key=${API_KEY}`;
  fetchImages(url);
} else if (arg === "range") {
  console.log(
    `This will download all available images numbered from ${expedition}-E-${parseInt(startRange)} to ${expedition}-E-${parseInt(endRange)}`,
  );
  const url = `https://eol.jsc.nasa.gov/SearchPhotos/PhotosDatabaseAPI/PhotosDatabaseAPI.pl?query=images|mission|eq|${expedition}|images|frame|ge|${parseInt(startRange)}|images|frame|le|${parseInt(endRange)}|images|directory|not%20like|*small*|images|directory|not%20like|*lowres*|images|directory|not%20like|*custom*|images|directory|not%20like|*EO*|images|directory|not%20like|*city*|images|directory|not%20like|*EFS*&return=images|directory|images|filename&key=${API_KEY}`;
  fetchImages(url);
} else {
  console.log("Invalid argument.");
}

const downloadImage = (el) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.resolve("GAPE", expedition, el["images.filename"]);
      const tmpFilePath = filePath + ".tmp";
      // Check if the file already exists
      if (fs.existsSync(filePath)) {
        console.log(`File already exists: ${filePath}`);
        resolve();
        return;
      }
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      axios
        .get(`${baseForm}${el["images.directory"]}/${el["images.filename"]}`, {
          responseType: "stream",
        })
        .then((response) => {
          const writer = fs.createWriteStream(tmpFilePath);
          response.data.pipe(writer);

          // Wait for the download to complete
          writer.on("finish", () => {
            // Rename the .tmp file to the final file name
            fs.renameSync(tmpFilePath, filePath);
            console.log(`Downloaded and saved ${filePath}`);
            resolve();
          });
        });
    } catch (error) {
      reject(error.message);
    }
  });
};
