<script setup lang="ts">
import { ref } from 'vue'
import { generateInvoice } from '@/utils/invoice-gen'
import type { InvoiceInfo, PriceInfo } from '@/types/types'
import { watch } from 'vue'
import { getUAHPrice, getCurrencyRate } from '@/utils/currency-calculator'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const deadlineDefault = new Date()
const vatPercentages = ref<number>(0)
const tempPrice = ref<number>(1000)
const calculationDefault = ref<boolean>(false)
const currencyRate = ref<number>(1)
const priceToShow = ref<PriceInfo>({
    price: 0,
    vatSum: 0,
    priceWithoutVat: 0
})
deadlineDefault.setDate(deadlineDefault.getDate() + 7)
const invoiceInfo = ref<InvoiceInfo>({
    customer: {
        type: 'Замовник',
        name: 'ТзОВ "Тестовий замовник"',
        edrpou: '12345678'
    },
    trip: {
        number: '123456',
        date: new Date(),
        description: 'Вантажне перевезення',
        currency: 'UAH',
        vat: 0,
        price: 1000,
        route: 'Київ(Україна) - Львів(Україна)',
        car: 'DAF AT6032НН/KOGEL AT3242XF',
        driver: 'Марцін Василь Богданович',
        paymentDeadline: deadlineDefault
    },
    priceInfo: {
        price: 1000,
        vatSum: 0,
        priceWithoutVat: 1000
    },
    account: {
        account: "123456789"
    }
})

const standardVehicles = [
    "DAF AT6032НН/KOGEL AT3242XF", "DAF AT6032EM/KOGEL AT5973XP"
]

const standardDrivers = [
    "Марцін Василь Богданович", "Люклян Юрій Петрович"
]

const standardCustomerTypes = [
    "Замовник", "Експедитор"
]

const standardDescription = [
    "Вантажне перевезення", "Міжнародне вантажне перевезення"
]

const standardCurrency = [
    "UAH", "USD", "EUR"
]

const submitForm = () => {
    if (calculationDefault.value) {
        invoiceInfo.value.priceInfo = priceToShow.value
        invoiceInfo.value.trip.currency = "UAH"
    }
    generateInvoice(invoiceInfo.value)
}

const format = 'dd.MM.yyyy'

watch(() => calculationDefault.value, () => {
    getCurrencyRateToShow()
    updatePriceToShow(calculationDefault.value)
})

watch(() => invoiceInfo.value.trip.price, () => {
    updatePriceToShow(calculationDefault.value)
})

watch(() => invoiceInfo.value.trip.vat, () => {
    updatePriceToShow(calculationDefault.value)
})

watch(() => invoiceInfo.value.trip.currency, (newValue) => {
    getCurrencyRateToShow()
    if (newValue == "UAH") {
        calculationDefault.value = false
    }
    updatePriceToShow(calculationDefault.value)
})

watch(() => invoiceInfo.value.trip.date, () => {
    getCurrencyRateToShow()
    updatePriceToShow(calculationDefault.value)
})

watch(() => vatPercentages.value, () => {
    invoiceInfo.value.trip.vat = vatPercentages.value / 100
    updatePriceToShow(calculationDefault.value)
})

watch(() => tempPrice.value, () => {
    invoiceInfo.value.trip.price = Number(tempPrice.value)
    updatePriceToShow(calculationDefault.value)
})

function updatePriceToShow(calculationDefault: boolean) {
    if (calculationDefault) {
        getUAHPrice(invoiceInfo.value.trip.price, invoiceInfo.value.trip.vat, invoiceInfo.value.trip.currency, invoiceInfo.value.trip.date)
            .then((result: PriceInfo) => {
                priceToShow.value = result;
            });
    } else {
        priceToShow.value = {
            price: invoiceInfo.value.trip.price,
            vatSum: invoiceInfo.value.trip.price - invoiceInfo.value.trip.price / (1 + invoiceInfo.value.trip.vat),
            priceWithoutVat: invoiceInfo.value.trip.price / (1 + invoiceInfo.value.trip.vat)
        }
    }
}

function getCurrencyToShow() {
    if (calculationDefault.value) {
        return "грн"
    } else {
        return invoiceInfo.value.trip.currency
    }
}

function getCurrencyRateToShow() {
    getCurrencyRate(invoiceInfo.value.trip.currency, invoiceInfo.value.trip.date).then((result: number) => {
        currencyRate.value = result
    })
}

</script>

<template>
    <div class="main-form-top-text">
        <h1>Генерація рахунку</h1>
    </div>
    <form @submit.prevent="submitForm">
        <div class="form-container">
            <section class="section-general">
                <h3>Загальна інформація</h3>
                <div class="input-content">
                    <label for="year">Дата:</label>
                    <VueDatePicker v-model="invoiceInfo.trip.date" hide-offset-dates :enable-time-picker="false"
                        :format="format" auto-apply required />
                </div>
                <div class="vuetify-element-container">
                    <v-text-field v-model="invoiceInfo.trip.number" hide-details label="Номер" variant="outlined"
                        required />
                </div>
            </section>

            <section class="section-details">
                <h3>Інформація про замовника</h3>
                <div class="vuetify-element-container">
                    <v-combobox v-model="invoiceInfo.customer.type" label="Тип замовника" :items="standardCustomerTypes"
                        variant="outlined" required hide-details></v-combobox>
                </div>
                <div class="vuetify-element-container">
                    <v-text-field v-model="invoiceInfo.customer.name" hide-details label="Назва замовника"
                        variant="outlined" required />
                </div>
                <div class="vuetify-element-container">
                    <v-text-field v-model="invoiceInfo.customer.edrpou" hide-details label="ЄДРПОУ" variant="outlined"
                        required/>
                </div>
            </section>

            <section class="section-financial">
                <h3>Оплата</h3>
                <div class="vuetify-element-container">
                    <v-combobox v-model="invoiceInfo.trip.currency" label="Валюта" :items="standardCurrency"
                        variant="outlined" required hide-details></v-combobox>
                </div>
                <div class="input-row-content" v-if="invoiceInfo.trip.currency != 'UAH'">
                    <input type="checkbox" id="calculation-checkbox" v-model="calculationDefault" />
                    <label for="calculation-checkbox" class="checkbox-label">Вирахувати суму у гривнях(курс НБУ на дату
                        складання
                        рахунку):</label>
                </div>

                <div class="vuetify-element-container">
                    <v-text-field v-model="tempPrice" hide-details label="Сума з ПДВ" variant="outlined"
                        type="number" min="0" />
                </div>
                <div class="vuetify-element-container">
                    <v-text-field v-model="vatPercentages" suffix="%" hide-details label="ПДВ" variant="outlined"
                        type="number" min="0" max="100" />
                </div>
                <div class="calculation-results">
                    <p v-if="calculationDefault">Курс НБУ на дату складання рахунку: {{ 1 }} {{ invoiceInfo.trip.currency }}
                        =
                        {{ currencyRate }} грн</p>
                    <p>Сума без ПДВ: {{ priceToShow.priceWithoutVat.toFixed(2) }} {{
                        getCurrencyToShow() }}</p>
                    <p>ПДВ: {{ priceToShow.vatSum.toFixed(2) }} {{ getCurrencyToShow() }}</p>
                    <p>Сума з ПДВ: {{ priceToShow.price.toFixed(2) }} {{ getCurrencyToShow() }}</p>
                </div>
            </section>

            <section class="section-transport">
                <h3>Деталі перевезення</h3>
                <div class="vuetify-element-container">
                    <v-text-field v-model="invoiceInfo.trip.route" hide-details label="Маршрут" variant="outlined"
                        required />
                </div>
                <div class="vuetify-element-container">
                    <v-combobox v-model="invoiceInfo.trip.car" label="Автомобіль" :items="standardVehicles"
                        variant="outlined" required hide-details></v-combobox>
                </div>
                <div class="vuetify-element-container">
                    <v-combobox v-model="invoiceInfo.trip.driver" label="Водій" :items="standardDrivers" variant="outlined"
                        required hide-details></v-combobox>
                </div>
                <div class="vuetify-element-container">
                    <v-combobox v-model="invoiceInfo.trip.description" hide-details label="Опис" :items="standardDescription"
                        variant="outlined" required></v-combobox>
                </div>
            </section>

            <section class="section-payment">
                <label for="paymentDate">Оплатити до:</label>
                <VueDatePicker v-model="invoiceInfo.trip.paymentDeadline" hide-offset-dates :enable-time-picker="false"
                    :format="format" auto-apply required />
            </section>

            <button type="submit" class="submit-button">Submit</button>
        </div>
    </form>
</template>

<style scoped>
.form-container {
    position: relative;
    background-color: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
    margin: 1rem 3rem;
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
}

.main-form-top-text {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    margin-left: 3rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    color: #333;
}

.section-general,
.section-details,
.section-financial,
.section-transport,
.section-payment {
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 15px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
    color: #4caf50;
    font-size: 1.2rem;
    margin-bottom: 10px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #555;
}

.checkbox-label {
    display: block;
    margin-bottom: 0px;
    color: #555;
}

.input-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

.vuetify-element-container {
    margin: 1rem 0;
}

input,
select,
textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
}

.input-row-content {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
}

.calculation-results p {
    margin: 5px 0;
    color: #333;
    font-weight: 500;
}

.submit-button {
    padding: 0.85rem;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #43a047;
}
</style>
