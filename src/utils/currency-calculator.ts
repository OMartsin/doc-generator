import type { PriceInfo } from '../types/types';

export async function getCurrencyRate(currency: string, date: Date): Promise<number> {
    const formattedDate = formatDate(date);
    const response = await fetch(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${formattedDate}&json`);

    if (!response.ok) {
        throw new Error('Failed to fetch currency rate');
    }

    const rates = await response.json();
    const currencyRate = rates.find((rate: any) => rate.cc === currency);

    if (!currencyRate) {
        throw new Error(`Currency rate for ${currency} not found`);
    }

    return currencyRate.rate;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const monthFormatted = month < 10 ? '0' + month : month;
    const dayFormatted = day < 10 ? '0' + day : day;

    return '' + year + monthFormatted + dayFormatted;
}

export async function getUAHPrice(price: number, vat: number, currency: string, date: Date): Promise<PriceInfo> {
    const rate = await getCurrencyRate(currency, date);
    const priceInUAH = price * rate;
    const vatSum = priceInUAH * vat / (1 + vat); // VAT part of the total price
    const priceWithoutVat = priceInUAH - vatSum; // Price excluding VAT

    return {
        price: priceInUAH,
        vatSum: vatSum,
        priceWithoutVat: priceWithoutVat
    };
}