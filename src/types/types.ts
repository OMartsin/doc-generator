export type AccountInfo = {
    bank: string;
    mfo: string;
    account: string;
}

export type CustomerInfo = {
    type: string;
    name: string;
    directorName: string;
    edrpou: string;
    ipn?: string;
    address: string;
    account: AccountInfo;
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
    priceInfo: PriceInfo;
}


export type PriceInfo = {
    price: number;
    vatSum: number;
    priceWithoutVat: number;
}