#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

walk(process.cwd() + "/dist", 0);

let cssFiles = getCSSFiles(process.cwd() + "/src/css");
fs.mkdir(process.cwd() + "/dist/css", () => {});
mergeCSSFiles(cssFiles, process.cwd() + "/dist/css/styles.css");
fs.cp("index.html", "./dist/index.html", () => {});

replaceStringInJSFiles(
  process.cwd() + "/dist",
  path.join(process.cwd() + "/dist", "@algodomain"),
  "update: true",
  "updateId: props.updateId"
);

function replaceStringInJSFiles(dir, excludeDir, searchString, replaceString) {
  let files = fs.readdirSync(dir);
  for (let file of files) {
    let filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (filePath !== excludeDir) {
        replaceStringInJSFiles(
          filePath,
          excludeDir,
          searchString,
          replaceString
        );
      }
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");
      content = content.split(searchString).join(replaceString);
      fs.writeFileSync(filePath, content);
    }
  }
}



function getCSSFiles(dir) {
  let files = fs.readdirSync(dir);
  let cssFiles = [];
  for (let file of files) {
    if (file.endsWith(".css")) {
      cssFiles.push(path.join(dir, file));
    }
  }
  return cssFiles;
}

// Function to merge CSS files into a single file
function mergeCSSFiles(files, outputFile) {
  let mergedCSS = "";
  for (let file of files) {
    let css = fs.readFileSync(file, "utf8");
    mergedCSS += css;
  }
  fs.writeFileSync(outputFile, mergedCSS);
}

function getParentPath(depth) {
  // Initialize the path with the current directory
  let path = "./";
  // Add the parent directory for each level of depth
  for (let i = 1; i < depth; i++) {
    path += "../";
  }
  return path;
}

function replaceStringInFile(filePath, level) {
  // Read the contents of the file
  let fileContents = fs.readFileSync(filePath, "utf8");

  // Replace all occurrences of the string
  if (filePath.includes("@algodomain")) {
    fileContents = fileContents.replace(/from "@algodomain/g, 'from ".');
  } else {
    fileContents = fileContents.replace(
      /from "@algodomain/g,
      'from "' + getParentPath(level) + "@algodomain"
    );
  }
  // Write the updated contents back to the file
  fs.writeFileSync(filePath, fileContents);
}

function walk(dir, level) {
  if (fs.statSync(dir).isFile() && path.extname(dir) === ".js") {
    replaceStringInFile(dir, level);
  }

  if (fs.statSync(dir).isDirectory()) {
    if (path.basename(dir) === "node_modules") {
      return;
    }

    var files = fs.readdirSync(dir);

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      walk(path.join(dir, file), level + 1);
    }
  }
}
