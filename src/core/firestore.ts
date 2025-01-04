#!/usr/bin/env node 

import { TransformedData } from "../types";
import { BulkWriter, CollectionReference, DocumentReference, Timestamp } from '@google-cloud/firestore';

export const sendDataToFirestore = async (
  data: Array<TransformedData>,
  bulkWriter: BulkWriter,
  colRefs: CollectionReference[]
): Promise<void> => {
  let processedCount = 0;
  const totalOperations = data.length * 3;
  const uploadTime = Timestamp.fromDate(new Date());

  bulkWriter.onWriteError((err) => {
    if (err.failedAttempts < 3) {
      return true;
    }
    console.error(`Failed write at document: ${err.documentRef.path}`);
    return false;
  });

  const updateProgress = () => {
    processedCount++;
    const progress = ((processedCount / totalOperations) * 100).toFixed(2);
    console.log(`Progress: ${progress}% (${processedCount}/${totalOperations})`);
  };

  for (const tsd of data) {
    const [zoneRef1, zoneRef2, zoneRef3] = colRefs;

    const baseData = {
      createdAt: Timestamp.fromDate(tsd.createdAt),
      uploadedAt: uploadTime,
    };

    const writes = [
      bulkWriter.create(zoneRef1.doc(), { ...baseData, energy: tsd.energyZone1 })
        .then(updateProgress),
      bulkWriter.create(zoneRef2.doc(), { ...baseData, energy: tsd.energyZone2 })
        .then(updateProgress),
      bulkWriter.create(zoneRef3.doc(), { ...baseData, energy: tsd.energyZone3 })
        .then(updateProgress)
    ];

   
  }

  try {
    await bulkWriter.flush();
    console.log(`Successfully uploaded ${totalOperations} documents to Firestore`);
  } catch (error) {
    console.error('Error flushing bulk writer:', error);
    throw error;
  }
};
