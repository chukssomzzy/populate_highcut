#!/usr/bin/env node

import 'dotenv/config'
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getCSVData, writeCSVData } from './src/utils/utils.csv';
import { CollectionReference, DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { sendDataToFirestore } from './src/core/firestore';

const CURRENT_TIME = new Date();

const run = async (): Promise<void> => {
  const outputFile = 'energyZoneReading.csv';

  try {
    console.log('\n=== Power Consumption Data Upload ===');
    console.log(`Started at: ${CURRENT_TIME.toISOString()}`);

    let dataFile = process.argv[2] || "powerconsumption.csv";
    console.log(`\nProcessing file: ${dataFile}`);

    console.log('Initializing Firebase...');
    const app = initializeApp({
      credential: applicationDefault()
    });
    const db = getFirestore();
    console.log('✓ Firebase initialized');

    console.log('\nReading CSV data...');
    const data = await getCSVData(dataFile);
    console.log(`✓ Loaded ${data.length} records`);

    console.log(data)

    console.log(`Writing Data to CSV file ${outputFile}`)
    await writeCSVData(outputFile, data); 

    const meterIds = [
      'KG2q00yApUIV3zStOOmJ',
      'g0nSqfK3HkcHsHqv8nVS',
      'vzcg2JzUlie8DNbOaH9S'
    ];
    
    console.log('\nCreating Firestore references...');
    const docRefs: CollectionReference[] = [];
    for (const id of meterIds) {
      const colRef = db.collection(`/Meter/${id}/MeterReadings`);
      docRefs.push(colRef);
      console.log(`✓ Created ref for meter: ${id}`);
    }

    // Start upload
    console.log('\nStarting Firestore upload...');
    console.time('Upload Duration');

    await sendDataToFirestore(data, db.bulkWriter(), docRefs);

    console.timeEnd('Upload Duration');

  } catch (error) {
    console.error('\nError during execution:', error);
    throw error;
  }
}

function main() {
  console.log(`\nStarting application at ${CURRENT_TIME.toISOString()}`);
  
  run()
    .then(() => {
      console.log('\n✓ Process completed successfully');
      process.exit(0);
    })
    .catch((e) => {
      console.error('\n✗ Process failed with error:');
      console.error(e);
      process.exit(1);
    });
}

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('\n✗ Fatal: Uncaught Exception');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n✗ Fatal: Unhandled Promise Rejection');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

main();
