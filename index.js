const axios = require("axios");
const jsdom = require("jsdom");
const tableToCsv = require("node-table-to-csv");
const fs = require("fs");

const path = "./";

const prompt = require("prompt-sync")({ sigint: true });
//With readline

const fetch = async (links, inputs) => {
  let finalCsv = '"NAME","ID","BASIN","ISO_TIME_________","NATURE","LAT","LON","WMO WIND","WMO PRES","USA WIND","TOKYO WIND","TOKYO PRES","CMA WIND","CMA PRES","HKO WIND","HKO PRES"\n';
  for (let index = 0; index < inputs.length; index += 1) {
    console.log(`Fetching ${inputs[index]} ...`);
    const response = await axios(inputs[index]);
    // console.log(response.data);

    const document = response.data;

    const dom = new jsdom.JSDOM(document);

    // console.log(dom.window.document.querySelectorAll('table[border="1"][width="650"]')[0].innerHTML);
    const table = dom.window.document.querySelectorAll(
      'table[border="1"][width="650"]'
    )[0].outerHTML;
    let name = '', id = '';
    let separatedName = dom.window.document.querySelectorAll('h1')[0].textContent.split('\n')[2].split(' ');
    for (let i = 0; i < separatedName.length; ++i) {
      if (separatedName[i] !== '' && separatedName[i] === separatedName[i].toUpperCase()) {
        name = separatedName[i];
        break;
      }
    };
    id = separatedName[separatedName.length - 1];
    console.log({ name, id });

    const csv = tableToCsv(table);

    finalCsv = finalCsv.concat(csv.split('\n').slice(2).map(str => (
      str !== '' ? `"${name}","${id.split('').slice(1, id.length - 1).join('')}",`.concat(str) : str
    )).join('\n'));
    fs.writeFileSync(path + `${links.split('.')[0]}.csv`, finalCsv);
  };
};

(async () => {
  while (true) {
    const links = prompt("File Name: ");
    const inputs = fs.readFileSync(`./${links}`).toString().split('\r\n');
    await fetch(links, inputs)
  }
})()
