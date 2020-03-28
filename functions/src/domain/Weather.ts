import { LocalDate } from './LocalDate';

/**
 * This class for managing weather class args.
 */
export interface WeatherArgs {
    date: LocalDate;
    type: string;
    highestTemp: number;
    lowestTemp: number;
    rainyPercent: number;
}

/**
 * This class for managing weather.
 */
export class Weather {
    date: LocalDate;
    type: string;
    highestTemp: number;
    lowestTemp: number;
    rainyPercent: number;

    constructor(args: WeatherArgs) {
        this.date = args.date;
        this.type = args.type;
        this.highestTemp = args.highestTemp;
        this.lowestTemp = args.lowestTemp;
        this.rainyPercent = args.rainyPercent;
    }
}
