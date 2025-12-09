import { inbox } from "file-transfer";
import { readFileSync } from "fs";

import { dataFile, dataType } from "../common/constants";

let data;
let handleCallback;

export function initialize(callback) {
  handleCallback = callback;
  data = loadData();
  inbox.addEventListener("newfile", fileHandler);
  fileHandler();
  updatedData();
}

function fileHandler() {
  // Process all new files in the inbox. Use a while loop so we only
  // attempt to read data when a file is actually returned by inbox.nextFile().
  let fileName = inbox.nextFile();
  while (fileName) {
    data = loadData();
    updatedData();
    fileName = inbox.nextFile();
  }
}

function loadData() {
  try {
    return readFileSync(`/private/data/${dataFile}`, dataType);
  } catch (ex) {
    console.error(`loadData() failed. ${ex}`);
    return;
  }
}

function existsData() {
  if (data === undefined) {
    console.warn("No data found.");
    return false;
  }
  return true;
}

function updatedData() {
  if (typeof handleCallback === "function" && existsData()) {
    handleCallback(data);
  }
}
