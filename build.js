const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const sharp = require('sharp');

config = {
    multipass: true,
    floatPrecision: 3,
    js2svg: {
        pretty: true
    },
    plugins: [
        {removeRasterImages: true},
        {cleanupListOfValues: true},
        {removeViewBox: true},
        {convertPathData: {noSpaceAfterFlags: false}},
        {sortAttrs: true},
        {removeDimensions: false}
    ]
};

svgo = new SVGO(config);

const filesOptions = {
    encoding: 'utf8',
    withFileTypes: true
};

function readDir(dir) {
    return fs.readdirSync(dir, filesOptions)
        .filter(x => x.isFile() && x.name.endsWith('.svg'))
        .map(x => path.resolve(__dirname, dir, x.name));
}

const files = [
    ...readDir('./src'),
    ...readDir('./src/icons')
];

const dest = path.resolve(__dirname, 'dist');
const pngHeight = 200;

async function svgoOptimize(data) {
    let result = await svgo.optimize(data, {input: 'string'});
    console.log(result.data);
    return result.data;
}

async function convert(file, dest, destPng) {
    let data = await fs.promises.readFile(file, 'utf8');
    let result = await svgo.optimize(data, {input: 'string'});
    await fs.promises.writeFile(dest, result.data, 'utf8');
    let buffer = Buffer.from(result.data, 'utf8');
    let metadata = await sharp(buffer).metadata();
    let density = metadata.height < pngHeight ? 1800 : 300;
    await sharp(buffer, {density: density})
        .resize({height: pngHeight})
        .toFile(destPng);
    return result.data.length;
}

async function convertAll() {
    for (const file of files) {
        let parts = path.parse(file);
        // if (parts.name != 'rs') {
        //     continue;
        // }
        let output = path.join(dest, parts.base);
        let outputPng = path.join(dest, parts.name + ".png");
        let length = await convert(file, output, outputPng);
        console.log(parts.base);
        console.log(length);
    }
}

convertAll();
