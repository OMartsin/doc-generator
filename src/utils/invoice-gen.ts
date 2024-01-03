import htmlContent from '@/resources/invoice-uk.html?raw';
import htmlENEURContent from '@/resources/invoice-en-eur.html?raw';
import htmlENUSDContent from '@/resources/invoice-en-usd.html?raw';
import htmlActContent from '@/resources/act.html?raw';
import htmlToDocx from 'html-docx-js/dist/html-docx';
import writtenNumber from 'written-number';
import type { InvoiceInfo } from '../types/types';

export function generateInvoice(invoiceInfo: InvoiceInfo) {
    const html = replaceInvoicePlaceholders(htmlContent, invoiceInfo);
    const converted = htmlToDocx.asBlob(html);
    const url = URL.createObjectURL(converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'рахунок-' + invoiceInfo.trip.number + '-' + invoiceInfo.trip.date.getFullYear() + '.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function generateENInvoice(invoiceInfo: InvoiceInfo, routeEn: string) {
    const htmlENContent = invoiceInfo.trip.currency == 'EUR' ? htmlENEURContent : htmlENUSDContent;
    let html = replaceInvoicePlaceholders(htmlENContent, invoiceInfo);
    html = replacePlaceholdersEN(html, invoiceInfo, routeEn);
    const converted = htmlToDocx.asBlob(html);
    const url = URL.createObjectURL(converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice-' + invoiceInfo.trip.number + '-' + invoiceInfo.trip.date.getFullYear() + '.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function generateAct(invoiceInfo: InvoiceInfo) {
    let html = replaceInvoicePlaceholders(htmlActContent, invoiceInfo);
    html = replaceActPlaceholders(html, invoiceInfo);
    const converted = htmlToDocx.asBlob(html);
    const url = URL.createObjectURL(converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'акт-' + invoiceInfo.trip.number + '-' + invoiceInfo.trip.date.getFullYear() + '.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function replaceInvoicePlaceholders(html: string, invoiceInfo: InvoiceInfo): string {
    const customerInfo = invoiceInfo.customer;
    const tripInfo = invoiceInfo.trip;
    const account = invoiceInfo.account;
    const priceInfo = invoiceInfo.priceInfo;
    console.log(priceInfo);
    return html
        .replace(/{invoice_number}/g, tripInfo.number + '/' + tripInfo.date.getFullYear())
        .replace(/{invoice_date}/g, tripInfo.date.toLocaleDateString())
        .replace(/{trip_type}/g, getTripType(tripInfo.description))
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

function replacePlaceholdersEN(html: string, invoiceInfo: InvoiceInfo, routeEn:string): string {
    const tripInfo = invoiceInfo.trip;
    const priceInfo = invoiceInfo.priceInfo;
    const translatedRoute = routeEn
    const translatedDescription = translateDescription(tripInfo.description);
    return html
        .replace(/{trip_total_words_en}/g, getTripTotalWordsEN(priceInfo.price, tripInfo.currency))
        .replace(/{trip_route_en}/g, translatedRoute)
        .replace(/{trip_car_en}/g, tripInfo.car)
        .replace(/{trip_driver_en}/g, transliterateCyrillicToLatin(tripInfo.driver))
        .replace(/{travel_description_en} /g, translatedDescription)
        .replace(/{trip_type_en}/g, getTripTypeEN(tripInfo.description))
        .replace(/{customer_address}/g, transliterateCyrillicToLatin(invoiceInfo.customer.address))
}

function replaceActPlaceholders(html: string, invoiceInfo: InvoiceInfo): string {
    const tripInfo = invoiceInfo.trip;
    const priceInfo = invoiceInfo.priceInfo;
    const customer_account = invoiceInfo.customer.account;
    let result = html
    .replace(/{invoice_text_date}/g, getDateInFormatString(tripInfo.date))
    .replace(/{trip_type_act}/g, getTripTypeForAct(tripInfo.description))
    .replace(/{trip_total_without_VAT_words}/g, getTripTotalWords(priceInfo.priceWithoutVat, tripInfo.currency))
    .replace(/{trip_VAT_words}/g, getTripTotalWords(priceInfo.vatSum, tripInfo.currency))
    .replace(/{customer_address}/g, invoiceInfo.customer.address)
    .replace(/{customer_account}/g, customer_account.account)
    .replace(/{customer_account_bank_name}/g, customer_account.bank)
    .replace(/{customer_bank_mfo}/g, customer_account.mfo)
    .replace(/{customer_company_type}/g, getCompanyType(invoiceInfo.customer.name))
    .replace(/{director_first_second_name}/g, invoiceInfo.customer.directorName)
    if (!invoiceInfo.customer.ipn || invoiceInfo.customer.ipn.trim() === '') {
        const ipnRegex = /<p[^>]*>\s*<span[^>]*>\s*ІПН\s{customer_ipn}\s*<\/span>\s*<\/p>/;
        result = result.replace(ipnRegex, '');
    }
    else {
        result = result.replace(/{customer_ipn}/g, invoiceInfo.customer.ipn)
    }

    return result;
}

function getCompanyType(name: string): string {
    if(name.includes('ТОВ')) {
        return 'Директор';
    }
    if(name.includes('ТзОВ')) {
        return 'Директор';
    }
    if(name.includes('ФОП')) {
        return 'ФОП';
    }
    if(name.includes('Фізична особа-підприємець')) {
        return 'ФОП';
    }
    if(name.includes('ПП')) {
        return 'Директор';
    }
    return 'Директор';
}

function getDateInFormatString(date: Date): string {
    return '«' + formatDayForAct(date) + '» ' + getMonthName(date.getMonth()) + ' ' + date.getFullYear() + ' р.'
}

function formatDayForAct(date: Date): string {
    return date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
}

function getMonthName(month: number): string {
    switch(month) {
        case 0: return 'січня';
        case 1: return 'лютого';
        case 2: return 'березня';
        case 3: return 'квітня';
        case 4: return 'травня';
        case 5: return 'червня';
        case 6: return 'липня';
        case 7: return 'серпня';
        case 8: return 'вересня';
        case 9: return 'жовтня';
        case 10: return 'листопада';
        case 11: return 'грудня';
        default: return '';
    }
}

function getTripTotalWords(price:number, currency:string): string {
    return writtenNumber(Math.trunc(price), {lang: 'uk'}) + ' ' + currencyFormatForPrint(currency, price)
        + ' ' + (price - Math.trunc(price)).toFixed(2).slice(2) + ' ' + "коп."
}

function getTripTotalWordsEN(price:number, currency:string): string {
    return writtenNumber(Math.trunc(price), {lang: 'en'}) + ' ' + currencyFormatForPrint(currency, price)
        + ' ' + (price - Math.trunc(price)).toFixed(2).slice(2) + ' ' + "cents"
}

function currencyFormat(currency: string): string {
    switch(currency) {
        case 'UAH': return "грн";
        case 'USD': return "USD";
        case 'EUR': return 'EUR';
        default: return '';
    }
}

function currencyFormatForPrint(currency: string, price:number): string {
    switch(currency) {
        case 'UAH': {
            return Math.trunc(price) % 10 === 0 ? "гривень" : Math.trunc(price) % 10 === 1 ? "гривня" : Math.trunc(price) % 10 < 5 ? "гривні" : "гривень";
        }
        case 'USD': return "USD";
        case 'EUR': return 'EUR';
        default: return '';
    }
}

function getTripType(description: string): string {
    switch(description) {
        case 'Вантажне перевезення': return '';
        case 'Міжнародне вантажні перевезення': return 'міжнародного';
        default: return '';
    }
}

function getTripTypeEN(description: string): string {
    switch(description) {
        case 'Вантажне перевезення': return '';
        case 'Міжнародне вантажні перевезення': return 'international';
        default: return '';
    }
}

function getTripTypeForAct(description: string): string {
    switch(description) {
        case 'Вантажне перевезення': return '';
        case 'Міжнародне вантажні перевезення': return 'міжнародних';
        default: return '';
    }

}

function translateDescription(description: string): string {
    let translatedDescription = description;
    if(description == 'Вантажне перевезення') {
        translatedDescription = 'Cargo transportation';
    }
    else if(description == 'Міжнародне вантажні перевезення'){
        translatedDescription = 'International cargo transportation';
    }
    return translatedDescription;   
}
function transliterateCyrillicToLatin(text: string): string {
    const transliterationMap: { [key: string]: string } = {
        'А': 'A', 'а': 'a',
        'Б': 'B', 'б': 'b',
        'В': 'V', 'в': 'v',
        'Г': 'H', 'г': 'h',
        'Ґ': 'G', 'ґ': 'g',
        'Д': 'D', 'д': 'd',
        'Е': 'E', 'е': 'e',
        'Є': 'Ye', 'є': 'ie',
        'Ж': 'Zh', 'ж': 'zh',
        'З': 'Z', 'з': 'z',
        'И': 'Y', 'и': 'y',
        'І': 'I', 'і': 'i',
        'Ї': 'Yi', 'ї': 'i',
        'Й': 'Y', 'й': 'i',
        'К': 'K', 'к': 'k',
        'Л': 'L', 'л': 'l',
        'М': 'M', 'м': 'm',
        'Н': 'N', 'н': 'n',
        'О': 'O', 'о': 'o',
        'П': 'P', 'п': 'p',
        'Р': 'R', 'р': 'r',
        'С': 'S', 'с': 's',
        'Т': 'T', 'т': 't',
        'У': 'U', 'у': 'u',
        'Ф': 'F', 'ф': 'f',
        'Х': 'Kh', 'х': 'kh',
        'Ц': 'Ts', 'ц': 'ts',
        'Ч': 'Ch', 'ч': 'ch',
        'Ш': 'Sh', 'ш': 'sh',
        'Щ': 'Shch', 'щ': 'shch',
        'Ю': 'Yu', 'ю': 'iu',
        'Я': 'Ya', 'я': 'ia',
        'ь': '', '’': '',
        'Ь': '', ' ' : ' ', '.': '.',
        '-': '-', ',': ',', ':': ':',
        '0': '0', '1': '1', '2': '2',
        '3': '3', '4': '4', '5': '5',
        '6': '6', '7': '7', '8': '8',
        '9': '9', 'A': 'A', 'B': 'B',
        'C': 'C', 'D': 'D', 'E': 'E',
        'F': 'F', 'G': 'G', 'H': 'H',
        'I': 'I', 'J': 'J', 'K': 'K',
        'L': 'L', 'M': 'M', 'N': 'N',
        'O': 'O', 'P': 'P', 'Q': 'Q',
        'R': 'R', 'S': 'S', 'T': 'T',
        'U': 'U', 'V': 'V', 'W': 'W',
        'X': 'X', 'Y': 'Y', 'Z': 'Z',
        'a': 'a', 'b': 'b', 'c': 'c',
        'd': 'd', 'e': 'e', 'f': 'f',
        'g': 'g', 'h': 'h', 'i': 'i',
        'j': 'j', 'k': 'k', 'l': 'l',
        'm': 'm', 'n': 'n', 'o': 'o',
        'p': 'p', 'q': 'q', 'r': 'r',
        's': 's', 't': 't', 'u': 'u',
        'v': 'v', 'w': 'w', 'x': 'x',
        'y': 'y', 'z': 'z'
    };

    return text.split('').map(char => transliterationMap[char]).join('');
}