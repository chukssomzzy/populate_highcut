#!/usr/bin/env node 


export const transformEnergy = (power: number, interval: number): number => {
  const kilo = 1000;
  const minPerHour = 60;
  const powerInKiloWatts = power / kilo;
  const timeInHour = interval / minPerHour; 

  const energyConsumption = powerInKiloWatts * timeInHour;

  return energyConsumption;
};
