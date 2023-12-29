<script setup lang="ts">
import { ref } from 'vue'
import { generateInvoice } from '@/invoice-gen'
import type { InvoiceInfo } from '@/invoice-gen'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const deadlineDefault = new Date()
const calculationDefault = false
const priceWithoutVatDefault = 0
deadlineDefault.setDate(deadlineDefault.getDate() + 7)
const invoiceInfo = ref<InvoiceInfo>({
    customer: {
        type: 'customer',
        name: 'Customer Name',
        edrpou: '12345678'
    },
    trip: {
        number: '123456',
        date: new Date(),
        description: 'Trip Description',
        currency: 'UAH',
        vat: 0,
        price: 1000,
        route: 'Route',
        car: 'Vehicle',
        driver: 'Driver',
        paymentDeadline: deadlineDefault
    },
    account: {
        account: "123456789"
    }
})

const submitForm = () => {
    console.log(invoiceInfo.value)
    const doc = generateInvoice(invoiceInfo.value)
}

const format = 'dd.MM.yyyy'


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
                        :format="format" required />
                </div>
                <div class="input-content">
                    <label for="number">Номер:</label>
                    <input type="text" v-model="invoiceInfo.trip.number" required />
                </div>
            </section>

            <section class="section-details">
                <h3>Інформація про замовника</h3>
                <label for="entityType">Тип замовника</label>
                <select v-model="invoiceInfo.customer.type" required>
                    <option value="customer">Замовник</option>
                    <option value="expeditor">Експедитор</option>
                </select>
                <div class="input-content">
                    <label for="name">Name:</label>
                    <input type="text" v-model="invoiceInfo.customer.name" required />
                </div>
                <div class="input-content">
                    <label for="edrpouCode">Код ЄДРПОУ:</label>
                    <input type="text" v-model="invoiceInfo.customer.edrpou" required />
                </div>
            </section>

            <section class="section-financial">
                <h3>Оплата</h3>
                <label for="currency">Валюта:</label>
                <select v-model="invoiceInfo.trip.currency" required>
                    <option value="UAH">UAH</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
                <div class="input-row-content" v-if="invoiceInfo.trip.currency != 'UAH'">
                    <input type="checkbox" id="calculation-checkbox" v-model="calculationDefault" />
                    <label for="calculation-checkbox"> Вирахувати суму у гривнях(курс НБУ на дату складання
                        рахунку):</label>
                </div>

                <div class="input-content">
                    <label for="amount">Сума з ПДВ:</label>
                    <input type="number" v-model="invoiceInfo.trip.price" required />
                </div>
                <div class="input-content">
                    <label for="vat">ПДВ:</label>
                    <input type="number" v-model="invoiceInfo.trip.vat" required step="0.05" min="0" max="1" />
                </div>
                <div class="calculation-results">
                    <p>Сума без ПДВ: {{ (invoiceInfo.trip.price / (1 + invoiceInfo.trip.vat)).toFixed(2) }} {{
                        invoiceInfo.trip.currency }}</p>
                    <p>ПДВ: {{ (invoiceInfo.trip.price - (invoiceInfo.trip.price / (1 +
                        invoiceInfo.trip.vat))).toFixed(2) }} {{ invoiceInfo.trip.currency }}</p>
                    <p>Сума з ПДВ: {{ invoiceInfo.trip.price.toFixed(2) }} {{ invoiceInfo.trip.currency }}</p>
                </div>
            </section>

            <section class="section-transport">
                <h3>Деталі перевезення</h3>
                <label for="route">Маршрут:</label>
                <input type="text" v-model="invoiceInfo.trip.route" required />

                <label for="vehicle">Автомобіль:</label>
                <input type="text" v-model="invoiceInfo.trip.car" required />

                <label for="driver">Водій:</label>
                <input type="text" v-model="invoiceInfo.trip.driver" required />
            </section>

            <section class="section-payment">
                <label for="paymentDate">Оплатити до:</label>
                <VueDatePicker v-model="invoiceInfo.trip.paymentDeadline" hide-offset-dates :enable-time-picker="false"
                    :format="format" required />
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

.input-content,
.input-row-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
}

input, select, textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
}

.input-row-content {
    flex-direction: row;
    align-items: center;
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
