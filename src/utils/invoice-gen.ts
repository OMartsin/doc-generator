import * as htmlToDocx from 'html-docx-js/dist/html-docx';
import htmlContent from '@/assets/invoice.html?raw';
import writtenNumber from 'written-number';
import type { InvoiceInfo } from '../types/types';

function currencyFormatForPrint(currency: string, price:number): string {
    switch(currency) {
        case 'UAH': {
            return Math.trunc(price) % 10 === 0 ? "гривень" : Math.trunc(price) % 10 === 1 ? "гривня" : Math.trunc(price) % 10 < 5 ? "гривні" : "гривень";
        }
        case 'USD': {
            return Math.trunc(price) % 10 === 0 ? "доларів" : Math.trunc(price) % 10 === 1 ? "долар" : Math.trunc(price) % 10 < 5 ? "долара" : "доларів";
        }
        case 'EUR': return 'євро';
        default: return '';
    }
}

export function currencyFormat(currency: string): string {
    switch(currency) {
        case 'UAH': return "грн";
        case 'USD': return "USD";
        case 'EUR': return 'EUR';
        default: return '';
    }
}


function replacePlaceholders(html: string, invoiceInfo: InvoiceInfo): string {
    const customerInfo = invoiceInfo.customer;
    const tripInfo = invoiceInfo.trip;
    const account = invoiceInfo.account;
    const priceInfo = invoiceInfo.priceInfo;
    return html
        .replace(/{invoice_number}/g, tripInfo.number + '/' + tripInfo.date.getFullYear())
        .replace(/{invoice_date}/g, tripInfo.date.toLocaleDateString())
        .replace(/{customer_name}/g, customerInfo.name)
        .replace(/{customer_edrpou}/g, customerInfo.edrpou)
        .replace(/{customer_type}/g, customerInfo.type)
        .replace(/{travel_description}/g, tripInfo.description)
        .replace(/{currency}/g, currencyFormat(tripInfo.currency)) 
        .replace(/{trip_price}/g, priceInfo.price.toFixed(2))
        .replace(/{trip_driver}/g, tripInfo.driver) 
        .replace(/{trip_car}/g, tripInfo.car) 
        .replace(/{trip_route}/g, tripInfo.route) 
        .replace(/{account}/g, account.account)
        .replace(/{trip_count}/g, '1') // replace with actual count
        .replace(/{trip_total_without_VAT}/g, priceInfo.priceWithoutVat.toFixed(2) ) 
        .replace(/{trip_VAT}/g, priceInfo.vatSum.toFixed(2) )
        .replace(/{trip_total_with_VAT}/g, priceInfo.price.toFixed(2) )
        .replace(/{trip_total_words}/g, getTripTotalWords(priceInfo.price, tripInfo.currency))
        .replace(/{payment_deadline}/g, tripInfo.paymentDeadline.toLocaleDateString())
}

export function getTripTotalWords(price:number, currency:string): string {
    return writtenNumber(Math.trunc(price), {lang: 'uk'}) + ' ' + currencyFormatForPrint(currency, price)
        + ' ' + (price - Math.trunc(price)).toFixed(2).slice(2) + ' ' + "коп"
}

export function generateInvoice(invoiceInfo: InvoiceInfo) {
    const html = replacePlaceholders(htmlContent, invoiceInfo);
    const converted = htmlToDocx.asBlob(html);
    const url = URL.createObjectURL(converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice-' + invoiceInfo.trip.number + '-' + invoiceInfo.trip.date.getFullYear() + '.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
