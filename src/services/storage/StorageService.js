const fs = require('fs');
const path = require('path');

class StorageService {
    constructor(folder) {
        this._folder = folder;

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    }

    writeFile(file, meta) {
        const filename = `${Date.now()}-${meta.filename}`;
        const filePath = path.join(this._folder, filename);
        const fileStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            file.on('error', (err) => reject(err));
            file.pipe(fileStream);
            file.on('end', () => resolve(filename));
        });
    }

    deleteFile(filename) {
        const filePath = path.join(this._folder, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

module.exports = StorageService;
