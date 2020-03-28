import { Weather } from '../domain/Weather';
import { DateFormat, LocalDate } from '../domain/LocalDate';
import * as admin from 'firebase-admin';

const puppeteer = require('puppeteer');

/**
 * This usecase class for weekly weather forecast.
 */
export class WeeklyWeatherForecastUsecase {

    private firestore: admin.firestore.Firestore;
    private batch: admin.firestore.WriteBatch;
    private collection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;

    private WEATHER_PAGE_URL = 'https://www.jma.go.jp/jp/week/';

    constructor() {
        admin.initializeApp({
            databaseURL: 'https://onesche-dev.firebaseio.com'
        });

        this.firestore = admin.firestore();
        this.batch = this.firestore.batch();
        this.collection = this.firestore.collection('WeeklyWeatherForecast');
    }

    async updateWeeklyWeatherForecast() {
        console.log('Started obtaining weekly weather forecast.');
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        try {
            const page = await browser.newPage();
            await page.goto(this.WEATHER_PAGE_URL);
            const forecastList = await page.$('.forecastlist');
            const tbody = await forecastList.$('tbody');
            const areas: any[] = await tbody.$$('tr');

            await Promise.all(areas.map(async area => await this.parseArea(area)));

            await this.batch.commit();

            console.log('Finished obtaining weekly weather forecast.');
        } catch (e) {
            console.error(e);
        } finally {
            await browser.close();
        }
    }

    async parseArea(area: any) {
        try {
            const td = await area.$('.area');
            if (!!td) {
                const content = await td.getProperty('textContent');
                const contentValue = await content.jsonValue();
                const name = contentValue.replace(/\r?\n/g, '');
                const tds: [any] = await area.$$('.forecast');

                await Promise.all(tds.map(async (forecast, index) => {
                    await this.parseWeather(forecast, name, index);
                }));
            }
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to get weekly weather forecast. area=${name}`);
        }
    }

    async parseWeather(forecast: any, name: string, index: number) {
        let min: string = '';
        let max: string = '';
        let weatherValue: string = '';
        let rainyPercentValue: string = '';

        const minTemp = await forecast.$('.mintemp');
        if (minTemp) {
            const minTempContent = await minTemp.getProperty('textContent');
            min = await minTempContent.jsonValue();
        }
        const maxTemp = await forecast.$('.maxtemp');
        if (maxTemp) {
            const maxTempContent = await maxTemp.getProperty('textContent');
            max = await maxTempContent.jsonValue();
        }
        const weather = await forecast.$('img');
        if (weather) {
            const weatherContent = await weather.getProperty('alt');
            weatherValue = await weatherContent.jsonValue();
        }
        const rainyPercent = await forecast.$('.pop');
        if (rainyPercent) {
            const rainyPercentContent = await rainyPercent.getProperty('textContent');
            rainyPercentValue = await rainyPercentContent.jsonValue();
        }

        const date = LocalDate.now();
        date.plusDays(index);

        const result = new Weather({
            lowestTemp: Number(min),
            highestTemp: Number(max),
            date: date,
            type: weatherValue,
            rainyPercent: WeeklyWeatherForecastUsecase.parseRainyPercentFromString(rainyPercentValue),
        });

        const ref = this.collection
            .doc('日本')
            .collection(name)
            .doc(result.date.format(DateFormat.YYYY_MM_DD));
        this.batch.set(ref, {
            type: result.type,
            highestTemp: result.highestTemp.toString(),
            lowestTemp: result.lowestTemp.toString(),
            rainyPercent: result.rainyPercent.toString(),
        });
    }

    private static parseRainyPercentFromString(rainyPercentValue: string) {
        if (rainyPercentValue.indexOf('/') !== -1) {
            const values = rainyPercentValue.split('/');
            let sum = 0;
            for (let value of values) {
                const number = Number(value);
                sum += number;
            }
            return Math.round(sum / values.length / 10) * 10;
        }
        return Number(rainyPercentValue);
    }

}
