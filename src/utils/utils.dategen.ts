#!/usr/bin/env node 


import {
  addMinutes, 
  parseISO,
  format
} from 'date-fns';

import { TimeseriesData } from '../types';

export const generateTimeseriesData = (startDate: Date, numberOfMonths: number): TimeseriesData[] => {
  const timeseriesData: TimeseriesData[] = []; 

  let currentDate = startDate; 

  const endDate = new Date(startDate); 
  endDate.setMonth(endDate.getMonth() + numberOfMonths); 

  while (currentDate <= endDate) {
    timeseriesData.push({
      timestamp: currentDate, 
      formattedTimeStamp: format(currentDate, "yyyy-MM-dd'T'HH:mm:ss'Z'")
    })

    currentDate = addMinutes(currentDate, 10);
  }

  return timeseriesData;
}

export const calculateInterval = (minInterval: number = 10, numOfMonth: number = 3): number => {
  const hoursPerDay = 24; 
  const minPerHour = 60; 
  const daysPerMonth = 30; 

  return (hoursPerDay * minPerHour * daysPerMonth * numOfMonth) / minInterval;  
}
