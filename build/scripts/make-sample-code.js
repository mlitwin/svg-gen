import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import * as cheerio from 'cheerio';
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examplesDir = path.resolve(__dirname, '../examples');
const docsDir = path.resolve(__dirname, '../output/examples');
const imgDir = path.join(docsDir, 'images');


const manifest = {
    examples: []
};

async function makeExample(file) {
    const srcPath = path.join(examplesDir, file);

    const outputFile = path.join(imgDir, file.replace(/\.js$/, '.svg'));

    try {
        const { stdout } = await new Promise((resolve, reject) => {
            exec(`node "${srcPath}"`, (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve({ stdout, stderr });
            });
        });

        await fs.promises.writeFile(outputFile, stdout);
    } catch (err) {
        console.error(`Error executing or writing SVG for ${file}:`, err);
        return;
    }

    let title = "";
    try {
        title = (await getSVGTitle(outputFile)).trim();
    } catch (err) {
        console.error(`Error getting SVG title for ${file}:`, err);
    }

    const fileContents = await fs.promises.readFile(srcPath, 'utf8');


    manifest.examples.push({
        filename: file,
        fileContents,
        image: file.replace(/\.js$/, '.svg'),
        title
    });
}

async function getSVGTitle(file) {
    try {
        const data = await fs.promises.readFile(file, 'utf8');
        const $ = cheerio.load(data, { xmlMode: true });
        const titleEl = $('svg > title');
        return titleEl.text();
    } catch (err) {
        console.error('Error reading file:', err);
        return "";
    }
}


const pageTemplate = Handlebars.compile(
    `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Examples</title>
</head>

<body>
    <div id="examples">
    {{#each examples}}
        <h2>{{title}}</h2>
        <div class="example">
            <img src="images/{{image}}">
            <pre><code>{{fileContents}}</code></pre>
        </div>
    {{/each}}
    </div>
</body>

</html>
`
);


async function main() {
    try {
        const files = await fs.promises.readdir(examplesDir);

        const jsFiles = files.filter(file => file.endsWith('.js'));
        for (const file of jsFiles) {
            await makeExample(file);
        }

        const page = pageTemplate(manifest);

        await fs.promises.writeFile(
            path.join(docsDir, 'index.html'),
            page
        );
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
