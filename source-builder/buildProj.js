const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

function removeProjectFile(distDir) {
  let files = fs.readdirSync(distDir, { recursive: true });
  files.forEach((file) => {
    const filePath = path.join(distDir, file);
    if (file !== "@algodomain" && file !== "@algodomain-temp") {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  });
}


function processProjFiles(srcDir) {
  fs.readdir(srcDir, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      let fullPath = path.join(srcDir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        processProjFiles(fullPath);
      }

      if (path.extname(file) !== ".js") return;
      if (file.includes("node_modules")) return;

      let newDestDir = "dist" + srcDir.replace("./", "").slice(3);

      fs.mkdirSync(newDestDir, { recursive: true });

      const srcFile = path.join(srcDir, file);
      const outFile = path.join(newDestDir, file);

      babel.transformFile(srcFile, {}, (err, result) => {
        if (err) throw err;

        fs.writeFile(outFile, result.code, (err) => {
          if (err) {
            throw err;
          } else {
            fs.appendFileSync("./dist/buildstatus.txt", "1");
          }
        });
      });
    });
  });
}

function buildProj() {
  const distDir = "./dist";
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  removeProjectFile("./dist");
  processProjFiles("./src");
}

module.exports = buildProj;
