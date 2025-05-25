import fs from "node:fs";
import * as path from "node:path";

const walkSync = (dir, callback) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stats.isFile()) {
            callback(filepath);
        }
    });
};

const commentRegex = /(^\s*\/\/.*$)|(\/\\*(\\*(?!\/)|[^*])*\\*\/)/mg;

const readJson = (file) => {
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data.replace(commentRegex, ""));
}

const versions = {}

walkSync("patches", file => {
    if (file.endsWith(".json") || file.endsWith(".jsonc")) {
        const parts = file.split("/");
        const data = readJson(file);

        if (parts.length > 2) {
            const version = parts[1];
            if (!versions[version]) {
                versions[version] = [];
            }
            versions[version].push(data);
        }
    }
});

for (let [version, data] of Object.entries(versions)) {
    const json = JSON.stringify(data, null, 0);
    fs.writeFileSync(
        path.join("cloudflare", `${version}.json`),
        json,
        "utf8"
    )
}