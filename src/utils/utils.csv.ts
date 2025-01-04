#!/usr/bin/env node 

import { parse } from "@fast-csv/parse";
import { format } from "@fast-csv/format";
import { promises as fs, WriteStream } from 'fs';
import { createWriteStream } from "fs";
import { PowerConsumptionData, TransformedData } from "../types";
import { calculateInterval, generateTimeseriesData } from "./utils.dategen";
import { transformEnergy } from './utils.energy';

const parseConfig = {
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


const parseCSV = (content: string): Promise<Array<TransformedData>> => {
  const results: TransformedData[] = [];
  const  numberOfMonths = 3;
  const sendIntervals = 10;
  const dateRange = generateTimeseriesData(new Date('2024-11-24'), numberOfMonths);
  let i = 0;

  return new Promise((resolve, reject) => {
    const stream = parse<PowerConsumptionData, TransformedData>(parseConfig) 
    .transform((data: PowerConsumptionData): TransformedData => { 
      return {
        createdAt: dateRange[i++]?.timestamp,
        energyZone1: transformEnergy(Number(data.powerConsumptionZone1), sendIntervals),
        energyZone2: transformEnergy(Number(data.powerConsumptionZone2), sendIntervals),
        energyZone3: transformEnergy(Number(data.powerConsumptionZone3), sendIntervals)
      }
    })
    .on('error', error => reject(error))
    .on('data', (row) => (results.push(row)))
    .on('end', (rowCount: number) => {
      console.log(`Parsed ${rowCount} data`); 
      resolve(results.slice(0, calculateInterval()));
    })

    stream.write(content)
    stream.end()    
  })
}

const formatConfig = {
  headers: true
};

const formatAndWriteCSV = async (data: Array<TransformedData>, fileStream: WriteStream): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const stream = format<TransformedData, TransformedData>(formatConfig)
    .transform((row: TransformedData) => {
      return {
        createdAt: row.createdAt.toISOString(),
        energyZone1: row.energyZone1,
        energyZone2: row.energyZone2,
        energyZone3: row.energyZone3
      }
    });

    stream.pipe(fileStream)
      .on("error", (error) => {
        console.error("Stream error:", error);
        reject(error);
      })
      .on("finish", () => {
        console.log("Data written to stream successfully");
        resolve(true);
      });

    data.forEach(row => {
      stream.write(row);
    });

    stream.end();
  });
}



const getCSVData = async (path: string): Promise<Array<TransformedData>> => {
  try {
    const content = await fs.readFile(path, {encoding: "utf-8"});

    let energyData: Array<TransformedData> = await parseCSV(content); 


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

const writeCSVData = async (path: string, data: Array<TransformedData>): Promise<void> => {
  try {
    const writeStream = createWriteStream(path, { flush: true }); 

    const streamWritten = await formatAndWriteCSV(data, writeStream); 

    if (!streamWritten) {
      throw new Error("Error writing csv");
    }

    writeStream.on('error', (error) => {
      console.error('Error writing to file:', error);
      throw error;
    });

  } catch (error) {
    console.error('Error in writeCSVData:', error);
    throw error;
  }
}

export {getCSVData, writeCSVData}
