export function getLastInvoiceNumber(): number {
    const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber');
    return lastInvoiceNumber ? parseInt(lastInvoiceNumber) : 0;
}


export const saveLastInvoiceNumber = (newNumber:number) => {
    localStorage.setItem('lastInvoiceNumber', newNumber.toString());
}