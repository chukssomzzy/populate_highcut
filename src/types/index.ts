#!/usr/bin/env node 

export interface PowerConsumptionData {
  createdAt: string;
  powerConsumptionZone1: string; 
  powerConsumptionZone2: string;
  powerConsumptionZone3: string;
};


export interface TransformedData {
  createdAt: Date;
  energyZone1: number;
  energyZone2: number; 
  energyZone3: number;
};

export interface FirebaseDocument {
  id: string; 
  energy: string;
  createdAt: Date;
  zone: number;
};  
export interface TimeseriesData {
  timestamp: Date; 
  formattedTimeStamp: string;
};
