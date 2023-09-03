const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const srcDir = "./node_modules/@algodomain";
const outTempDir = "./dist/@algodomain-temp";

function startCopy(outDir) {
  if (fs.existsSync(outTempDir)) {
    fs.rmdir(outTempDir, () => {});
  }
  fs.mkdirSync(outTempDir, { recursive: true });

  glob(
    `${srcDir}/**/*.js`,
    { ignore: ["**/src/", "**/path-resolver.js"] },
    (err, files) => {
      if (err) throw err;
      files
        .filter(
          (file) =>
            !file.toString().includes("path-resolver.js") &&
            !file.toString().includes("/src/")
        )
        .forEach((file) => {
          const fileName = path.basename(file);
          const outFile = path.join(outTempDir, fileName);
          fs.copyFileSync(file, outFile);
        });
      processFiles(outDir);
    }
  );
}

function processFiles(outDir) {
  fs.readdir(outTempDir, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      if (path.extname(file) !== ".js") return;

      const srcFile = path.join(outTempDir, file);
      const outFile = path.join(outDir, file);

      babel.transformFile(srcFile, {}, (err, result) => {
        if (err) throw err;

        fs.writeFile(outFile, result.code, (err) => {
          if (err) throw err;
        });
        fs.rmSync(srcFile);
        removeTempDir(outTempDir);
      });
    });
  });
}

function removeTempDir(outTempDir) {
  fs.readdir(outTempDir, (err, files) => {
    if (err) throw err;
    if (files.length === 0) {
      fs.rmdirSync(outTempDir);
    }
  });
}

function buildAlgo() {
  const outDir = "./dist/@algodomain";
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    startCopy(outDir);
    console.log("framework coppied!");
  } else {
    console.log(
      "framework existing in path, use cleanbuild to re-copy framework"
    );
  }
}

module.exports = buildAlgo;
