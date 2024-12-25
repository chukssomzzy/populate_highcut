#!/usr/bin/env node 

import { parse } from "@fast-csv/parse";
import { promises as fs } from 'fs'; 
import { PowerConsumptionData, TransformedData } from "../types";
import { calculateInterval, generateTimeseriesData } from "./utils.dategen";

const config = {
  headers: [
    'createdAt',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'powerConsumptionZone1',
    'powerConsumptionZone2',
    'powerConsumptionZone3'
  ], 
  renameHeaders: true,
  ignoreEmpty: true, 
  strictColumnHandling: true, 
  trim: true,
  encoding: 'utf-8',
  maxRow: calculateInterval()
}


const parseCSV = (content: string): Promise<Array<PowerConsumptionData>> => {
  const dateRange = generateTimeseriesData(new Date('2024-11-24'), 3);
  const i = 0;

  return new Promise((resolve, reject) => {
    const stream = parse<PowerConsumptionData, TransformedData>(config) 
    .transform((data: PowerConsumptionData): TransformedData => ({

    }))
    .on('error', error => reject(error))
    .on('data', (row) => (resolve(row)))
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} usernames`))

    stream.write(content)
    stream.end()    
  })
}


const getCSVData = async (path: string): Promise<Array<PowerConsumptionData> | Array<object>> => {
  try {
    const content = await fs.readFile(path, {encoding: "utf-8"});

    let energyData: Array<PowerConsumptionData> = await parseCSV(content); 


    if (!energyData) {
      console.error(`No energyData found in: ${path}`);
      return [];
    }

    return energyData;
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    throw error;
  }
}

export {getCSVData}
