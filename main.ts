#!/usr/bin/env node

import 'dotenv/config'
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getCSVData } from './src/utils/utils.csv';


const run = async (): Promise<void> => {
  try {
    let dataFile = process.argv[2];

    const app = initializeApp({
      credential: applicationDefault()
    });

    if (process.argv.length < 3) {
      dataFile = "powerconsumption.csv";
    }

    const data = await getCSVData(dataFile); 

    console.log(data);
  } catch (error) {
    throw error;
  }
}


function main() {
  run()
  .catch((e) => {
    console.log(`${e}`)
    process.exit(1);
  })
}

main();
