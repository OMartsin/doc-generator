<script setup lang="ts">
import { ref } from 'vue'
import { generateInvoice, generateENInvoice, generateAct } from '@/utils/invoice-gen'
import type { InvoiceInfo, PriceInfo } from '@/types/types'
import { watch } from 'vue'
import { getUAHPrice, getCurrencyRate } from '@/utils/currency-calculator'
import VueDatePicker from '@vuepic/vue-datepicker';
import {getLastInvoiceNumber, saveLastInvoiceNumber} from '@/utils/last-invoice-number';
import '@vuepic/vue-datepicker/dist/main.css'

const deadlineDefault = new Date()
const vatPercentages = ref<number>(20)
const tempPrice = ref<number>(1200)
const calculationDefault = ref<boolean>(false)
const invoiceLanguageIsEnglish = ref<boolean>(false)
const isActNeeded = ref<boolean>(false)
const routeEn = ref<string>("")
const currencyRate = ref<number>(1)
const priceToShow = ref<PriceInfo>({
    price: 1200,
    vatSum: 200,
    priceWithoutVat: 1000
})
deadlineDefault.setDate(deadlineDefault.getDate() + 7)
const invoiceInfo = ref<InvoiceInfo>({
    customer: {
        type: 'Замовник',
        name: '',
        directorName: '',
        edrpou: '',
        ipn: '',
        address: "",
        account: {
            account: "",
            bank: "",
            mfo: ""
        }
    },
    trip: {
        number: (getLastInvoiceNumber() + 1).toString(),
        date: new Date(),
        description: 'Вантажне перевезення',
        currency: 'UAH',
        vat: 0.2,
        price: 1200,
        route: '',
        car: 'DAF AT6032НН/KOGEL AT3242XF',
        driver: 'Марцін Василь Богданович',
        paymentDeadline: deadlineDefault
    },
    priceInfo: {
        price: 1200,
        vatSum: 200,
        priceWithoutVat: 1000
    },
    account: {
        account: "123456789",
        bank: "АТ КБ ПРИВАТБАНК",
        mfo: "305299"
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

const currencyAccounts: { [key: string]: string } = {
    "UAH": "UA593052990000026007005508116",
    "USD": "UA933052990000026005025512076",
    "EUR": "UA443052990000026009035510224"
}

const format = 'dd.MM.yyyy'

watch(() => calculationDefault.value, () => {
    getCurrencyRateToShow()
    updatePriceToShow(calculationDefault.value)
})

watch(() => invoiceLanguageIsEnglish.value, () => {
    if (invoiceLanguageIsEnglish.value && invoiceInfo.value.customer.name == 'ТзОВ "Тестовий замовник"') {
        invoiceInfo.value.customer.name = "Test customer Ltd."
        invoiceInfo.value.customer.address = "00000, Kyiv, Testova str., 1"
        invoiceInfo.value.trip.route = "Kyiv (Ukraine) - Lviv (Ukraine)"
        invoiceInfo.value.trip.driver = "Марцін Василь Богданович"
    } else if (!invoiceLanguageIsEnglish.value && invoiceInfo.value.customer.name == "Test customer Ltd.") {
        invoiceInfo.value.customer.name = 'ТзОВ "Тестовий замовник"'
        invoiceInfo.value.customer.address = "00000, м. Київ, вул. Тестова, 1"
        invoiceInfo.value.trip.route = "Київ(Україна) - Львів(Україна)"
        invoiceInfo.value.trip.driver = "Марцін Василь Богданович"
    }
})

watch(() => invoiceInfo.value.trip.date, () => {
    let deadline = new Date(invoiceInfo.value.trip.date)
    deadline.setDate(deadline.getDate() + 7)
    invoiceInfo.value.trip.paymentDeadline = deadline
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


const submitForm = () => {
    saveLastInvoiceNumber(Number(invoiceInfo.value.trip.number))
    invoiceInfo.value.account.account = currencyAccounts[invoiceInfo.value.trip.currency]
    if (calculationDefault.value) {
        invoiceInfo.value.priceInfo = priceToShow.value
        invoiceInfo.value.trip.currency = "UAH"
        invoiceInfo.value.account.account = currencyAccounts.UAH
    }
    if (invoiceInfo.value.trip.currency == "UAH") {
        invoiceInfo.value.priceInfo = priceToShow.value
    }
    if (invoiceLanguageIsEnglish.value) {
        generateENInvoice(invoiceInfo.value, routeEn.value)
        return
    }
    generateInvoice(invoiceInfo.value)
    if(isActNeeded.value){
        generateAct(invoiceInfo.value)
    }
    invoiceInfo.value.trip.number = (Number(invoiceInfo.value.trip.number) + 1).toString()
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
                    <VueDatePicker locale="uk" v-model="invoiceInfo.trip.date" hide-offset-dates :enable-time-picker="false"
                        :format="format" auto-apply required />
                </div>
                <div class="vuetify-element-container">
                    <v-text-field v-model="invoiceInfo.trip.number" hide-details label="Номер" variant="outlined"
                        required />
                </div>
                <v-switch v-model="invoiceLanguageIsEnglish" small hide-details color="success"
                    label="Згенерувати рахунок англійською"></v-switch>
                <v-switch v-model="isActNeeded" small hide-details color="success"
                    label="Згенерувати акт виконаних робіт"></v-switch>
            </section>

            <section class="section-details">
                <h3>Інформація про замовника</h3>
                <div class="vuetify-element-container">
                    <v-select v-model="invoiceInfo.customer.type" label="Тип замовника" :items="standardCustomerTypes"
                        variant="outlined" required hide-details></v-select>
                </div>
                <div class="vuetify-element-container">
                    <v-text-field v-model="invoiceInfo.customer.name" hide-details
                        :label="invoiceLanguageIsEnglish ? 'Назва замовника(латиницею)' : 'Назва замовника'"
                        variant="outlined" required />
                </div>
                <div class="vuetify-element-container" v-if="isActNeeded">
                    <v-text-field v-model="invoiceInfo.customer.directorName" hide-details
                        label="Ім'я та ПРІЗВИЩЕ директора"
                        variant="outlined" :required="isActNeeded" />
                </div>
                <div class="vuetify-element-container" v-if="!(invoiceLanguageIsEnglish&&!isActNeeded)">
                    <v-text-field v-model="invoiceInfo.customer.edrpou" hide-details label="ЄДРПОУ" variant="outlined"
                        :required="!invoiceLanguageIsEnglish" />
                </div>
                <div class="vuetify-element-container" v-if="((invoiceLanguageIsEnglish)||(isActNeeded))">
                    <v-text-field v-model="invoiceInfo.customer.address" hide-details :label="!invoiceLanguageIsEnglish ?
                        'Адреса' : 'Адреса(латиницею)'" variant="outlined" :required="invoiceLanguageIsEnglish || isActNeeded" />
                </div>
                <div class="vuetify-element-container" v-if="isActNeeded">
                    <v-text-field v-model="invoiceInfo.customer.ipn" hide-details label="ІПН(необов'язковий)"
                        variant="outlined" />
                </div>
                <section v-if="isActNeeded">
                    <h4>Рахунок замовника</h4>
                    <div class="vuetify-element-container">
                        <v-text-field v-model="invoiceInfo.customer.account.account" hide-details label="Рахунок"
                            variant="outlined" :required="isActNeeded"/>
                        <div class="vuetify-element-container">
                            <v-text-field v-model="invoiceInfo.customer.account.bank" hide-details label="Назва банку"
                                variant="outlined" :required="isActNeeded"/>
                        </div>
                        <div class="vuetify-element-container">
                            <v-text-field v-model="invoiceInfo.customer.account.mfo" hide-details label="МФО банку"
                                variant="outlined"  :required="isActNeeded"/>
                        </div>
                    </div>
                </section>
            </section>

            <section class="section-financial">
                <h3>Оплата</h3>
                <div class="vuetify-element-container">
                    <v-select v-model="invoiceInfo.trip.currency" label="Валюта" :items="standardCurrency"
                        variant="outlined" required hide-details></v-select>
                </div>
                <div class="input-row-content" v-if="invoiceInfo.trip.currency != 'UAH' && !invoiceLanguageIsEnglish">
                    <input type="checkbox" id="calculation-checkbox" v-model="calculationDefault" />
                    <label for="calculation-checkbox" class="checkbox-label">Вирахувати суму у гривнях(курс НБУ на дату
                        складання
                        рахунку):</label>
                </div>

                <div class="vuetify-element-container">
                    <v-text-field v-model="tempPrice" hide-details label="Сума з ПДВ" variant="outlined" type="number"
                        min="0" />
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
                <div class="vuetify-element-container" v-if="invoiceLanguageIsEnglish">
                    <v-text-field v-model="routeEn" hide-details label="Маршрут(англійською)" variant="outlined"
                        :disabled="!invoiceLanguageIsEnglish" :required="invoiceLanguageIsEnglish" />
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
                    <v-select v-model="invoiceInfo.trip.description" hide-details label="Опис" :items="standardDescription"
                        variant="outlined" required></v-select>
                </div>
            </section>

            <section class="section-payment">
                <label for="paymentDate">Оплатити до:</label>
                <VueDatePicker locale="uk" v-model="invoiceInfo.trip.paymentDeadline" hide-offset-dates :enable-time-picker="false"
                    :format="format" auto-apply required />
            </section>

            <v-btn class="text-none text-subtitle-1" color="#4caf50" block variant="flat" type="submit">Submit</v-btn>
        </div>
    </form>
</template>

<style scoped>


.form-container {
    position: relative;
    background-color: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
    margin: 1rem var(--invoice-page-margin-left);
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
}

.main-form-top-text {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    margin-left: 2.25rem;
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
</style>
