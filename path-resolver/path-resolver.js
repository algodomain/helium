#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");


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

const filePattern = "src/*.js";
const linePattern = /<Route.*/gm;


// define callback function
function findLines(error, files) {
  // check for error
  if (error) {
    console.error(error);
    return;
  }
  // loop over files
  for (let file of files) {
    // read file content
    let content = fs.readFileSync(file, "utf8");
    // find matching lines
    let lines = content.match(linePattern);
    // check if lines are found

    if (lines) {
      // print or return lines
      lines.forEach((line) => {
        let path = getAttributeValue(line, "path");
        console.log(path);
        generateRoutingFile("dist" + path);
      });
    }
  }
}

// call glob function

function getAttributeValue(str, attributeName) {
  let regex = /\s+(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^><"' \s]+)))?/g;
  let attributes = {};
  let match;
  while ((match = regex.exec(str))) {
    let name = match[1];
    let value = match[2] || match[3] || match[4];
    attributes[name] = value;
  }
  let value = attributes[attributeName];
  if (value) {
    return value;
  } else {
    return null;
  }
}

// define the folder name and the file name

function generateRoutingFile(folderName) {
  const fileName = "index.html";
  const fileContent = "<script>window.location.href = '/'</script>";
  fs.mkdir(folderName, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(`${folderName}/${fileName}`, fileContent, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Folder and file created successfully!");
        }
      });
    }
  });
}

glob(filePattern, findLines);
