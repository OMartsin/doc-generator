import * as htmlToDocx from 'html-docx-js/dist/html-docx';
import htmlContent from './assets/invoice.html?raw';
import writtenNumber from 'written-number';

export type AccountInfo = {
    // name: string;
    // edrpou: string;
    // bank: string;
    // mfo: string;
    account: string;
}

export type CustomerInfo = {
    type: string;
    name: string;
    edrpou: string;
}

export type TripInfo = {
    number: string;
    date: Date;
    description: string;
    currency: string;
    vat: number;
    price: number;
    route: string;
    driver: string;
    car: string;
    paymentDeadline: Date;
}

export type InvoiceInfo = {
    customer: CustomerInfo;
    trip: TripInfo;
    account: AccountInfo;
}

interface PriceInfo {
    price: number;
    vat: number;
    priceWithoutVat: number;
}


function replacePlaceholders(html: string, invoiceInfo: InvoiceInfo): string {
    const customerInfo = invoiceInfo.customer;
    const tripInfo = invoiceInfo.trip;
    const account = invoiceInfo.account;
    const priceInfo = getTripPrice(tripInfo);
    return html
        .replace(/{invoice_number}/g, tripInfo.number + '/' + tripInfo.date.getFullYear())
        .replace(/{invoice_date}/g, tripInfo.date.toLocaleDateString())
        .replace(/{customer_name}/g, customerInfo.name)
        .replace(/{customer_edrpou}/g, customerInfo.edrpou)
        .replace(/{customer_type}/g, customerInfo.type)
        .replace(/{travel_description}/g, tripInfo.description)
        .replace(/{currency}/g, tripInfo.currency) 
        .replace(/{trip_price}/g, priceInfo.price.toFixed(2))
        .replace(/{trip_driver}/g, tripInfo.driver) 
        .replace(/{trip_car}/g, tripInfo.car) 
        .replace(/{trip_route}/g, tripInfo.route) 
        .replace(/{account}/g, account.account)
        .replace(/{trip_count}/g, '1') // replace with actual count
        .replace(/{trip_total_without_VAT}/g, priceInfo.priceWithoutVat.toFixed(2) ) 
        .replace(/{trip_VAT}/g, priceInfo.vat.toFixed(2) )
        .replace(/{trip_total_with_VAT}/g, priceInfo.price.toFixed(2) )
        .replace(/{trip_total_words}/g, writtenNumber(Math.trunc(tripInfo.price) + Math.trunc((tripInfo.price - 
            Math.trunc(tripInfo.price)) * 100) + "коп."))
        .replace(/{payment_deadline}/g, tripInfo.paymentDeadline.toLocaleDateString());
}

function getTripPrice(tripInfo: TripInfo): PriceInfo {
    const priceWithoutVat =  Number((tripInfo.price / (1 + tripInfo.vat)).toFixed(2));
    const vat = Number((tripInfo.price - (tripInfo.price / (1 + tripInfo.vat))).toFixed(2));
    return {
        price: tripInfo.price,
        vat,
        priceWithoutVat
    };
}


export function generateInvoice(invoiceInfo: InvoiceInfo) {
    const html = replacePlaceholders(htmlContent, invoiceInfo);
    const converted = htmlToDocx.asBlob(html);
    const url = URL.createObjectURL(converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
