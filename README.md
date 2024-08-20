# GAPE Downloader

A Node.js script for batch downloading GAPE Imagery, designed to retrieve high-quality images from GAPE's expansive database.

## Prerequisites

- [Node.js](https://nodejs.org/)
- A valid [GAPE](https://eol.jsc.nasa.gov/) API key

## Installation

### 1. Clone the Repository

Start by cloning the repository to your local machine:

```bash
git clone https://github.com/Slowsby/GAPE_Downloader
cd GAPE_Downloader
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Rename the `.env.example` file to `.env` and add your GAPE API key:

Edit the `.env` file to include your GAPE API key:
```bash
API_KEY=YOURAPIKEY
```

## Usage
To download imagery for a specific expedition, run the script with the desired expedition. The `EXPEDITION_NUMBER` should align with GAPE's [Database Mission ID.](https://eol.jsc.nasa.gov/FAQ/default.htm#cameraMetadata_Mission)
```bash
npm run start -- EXPEDITION_NUMBER
```

#### Downloading a Specific Range of Images
If you want to download a specific range of images from an expedition, use the range option. This allows you to specify the start and end points of the range. The `EXPEDITION_NUMBER` should be followed by `START_IMAGE` and `END_IMAGE`, which define the starting and ending image numbers respectively.

```bash
npm run range -- EXPEDITION_NUMBER START_IMAGE END_IMAGE
```
## ⚠️ Image Copyright and Attribution

All images downloaded using this script are the property of the [Earth Science and Remote Sensing Unit, NASA Johnson Space Center ](https://eol.jsc.nasa.gov/).

NASA generally does not maintain a copyright on their images, meaning they are typically free to use. However, proper attribution to the source is recommended. Please ensure to verify any specific usage requirements or restrictions on the [EOL website](https://eol.jsc.nasa.gov/FAQ/#Couoap).


> NASA should be acknowledged as the source of the material. For astronaut photography of Earth accessed through this website, please state “Image courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center" or "Video courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center" as appropriate. We recommend that the caption or supporting materials used for any photograph published include the unique photo number (Mission-Roll-Frame), and our website (eol.jsc.nasa.gov) so that others can locate or obtain copies when needed.

## Responsible Use

This tool is intended to facilitate the retrieval of imagery for educational, research, and non-commercial purposes. Please use it respectfully and responsibly. 
