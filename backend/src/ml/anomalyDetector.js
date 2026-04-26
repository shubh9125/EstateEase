const { execFile } = require("child_process");
const path = require("path");

function detectAnomaly(propertyData) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, "predict.py");

        execFile(
            "python",
            [scriptPath, JSON.stringify(propertyData)],
            { cwd: __dirname },
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            }
        );
    });
}

module.exports = { detectAnomaly };