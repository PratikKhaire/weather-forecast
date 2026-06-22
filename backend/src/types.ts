export interface Location {
    city: string;
    country: string;
    lat: number;
    lon: number;
}

export interface CurrentWeather {

    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    description: string;
    icon: string;

}

export interface DailyForecast {
    date: string;
    day: string;
    tempMin: number;
    tempMax: number;
    humidity: number;

    windSpeed: number;
    condition: string;
    icon: string;
    rainChance: number;

}