#!/usr/bin/env node

import fs from "fs";
import { stringify } from "csv-stringify";
import inquirer from "inquirer";
import ExcelJS from "exceljs";
import os from "os";

const QUESTIONS = [
  {
    type: "input",
    name: "filepath",
    message:
      "랜덤으로 뽑을 파일의 이름을 입력해주세요. 반드시 파일은 바탕화면에 존재해야하며, 엑셀파일(xlsx)만 가능합니다. \n(예시: 20명추첨)",
    validate: (input) => input.trim().length !== 0,
    transformer: (input) => input.trim(),
  },
  {
    type: "input",
    name: "howmany",
    message: "몇 명을 추첨하시겠습니까?",
    validate: (input) => parseInt(input.trim()) > 0,
    transformer: (input) => input.trim(),
  },
  {
    type: "input",
    name: "outputFilepath",
    message:
      "저장될 csv 파일의 이름을 입력해주세요. 파일은 바탕화면에 저장됩니다. \n(예시: 20명추첨결과)",
    transformer: (input) => input.trim(),
  },
];

async function main() {
  await showLogo();

  const {
    filepath: _filepath,
    howmany,
    outputFilepath: _outputFilepath,
  } = await inquirer.prompt(QUESTIONS);

  const filepath = serializeFilePath(`~/Desktop/${_filepath}.xlsx`);
  const outputFilepath = serializeFilePath(`~/Desktop/${_outputFilepath}.csv`);

  const files = await readFileAndSerialize(filepath);
  const result = getRandom(files, parseInt(howmany));

  const serializedResult = result.reduce(
    (acc, curr) => {
      acc.push([curr]);
      return acc;
    },
    [["Results"]]
  );

  stringify(serializedResult, (err, output) => {
    if (err) throw err;
    fs.writeFileSync(outputFilepath, output);
  });

  console.log(`${outputFilepath} 에 저장이 완료되었습니다!`);
}

main();

async function showLogo() {
  const logo = `
  _________                                      _________                __                
  /   _____/ ____   ____   _____    ____   ____   \\_   ___ \\_____ ________/  |_  ___________ 
  \\_____  \\ /  _ \\ /  _ \\ /     \\  / ___\\ /  _ \\  /    \\  \\/\\__  \\\\_  __ \\   __\\/ __ \\_  __ \\
  /        (  <_> |  <_> )  Y Y  \\/ /_/  >  <_> ) \\     \\____/ __ \\|  | \\/|  | \\  ___/|  | \\/
 /_______  /\\____/ \\____/|__|_|  /\\___  / \\____/   \\______  (____  /__|   |__|  \\___  >__|   
         \\/                    \\//_____/                  \\/     \\/                 \\/                                      
  `;
  console.log(logo);
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

function getRandom(arr, n) {
  let result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("뽑을 수 있는 개수보다 뽑으려는 개수가 많습니다.");
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

async function readFileAndSerialize(filepath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filepath);
  const worksheet = workbook.worksheets[0];
  const rows = worksheet.getRows(1, worksheet.rowCount - 1);

  return rows.map((row) => row.getCell(1).value);
}

function serializeFilePath(filepath) {
  return filepath.replace("~", os.homedir());
}
