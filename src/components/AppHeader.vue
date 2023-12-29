<script setup lang="ts">
import router from '@/router'
import { ref } from 'vue'
const dropdown = ref(false)

function toggleDropdown() {
  console.log('toggleDropdown')
  dropdown.value = !dropdown.value
}

function setShowValue(val: boolean) {
  dropdown.value = val
}
</script>

<template>
  <header class="header-item">
    <div class="header-item-content-div">
      <button
        class="header-button"
        :class="{
          'active-button': router.currentRoute.value.name === 'invoices',
        }"
        @click="() => router.push({ name: 'invoices' })"
        id="main-button"
      >Рахунки
      </button>
      <button
        class="header-button"
        :class="{
          'active-button': router.currentRoute.value.name === 'acts',
        }"
        @click="() => router.push({ name: 'acts' })"
        id="activity-button"
      >Акти
      </button>
    </div>
  </header>
</template>

<style scoped>
.header-item {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 0.75rem 3rem;
  background-color: #f8f8f8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-item-content-div {
  display: flex;
  gap: 1.5rem;
}

.header-button {
  background-color: transparent;
  border-radius: 4px;
  height: 2.25rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

button {
  border: none;
  cursor: pointer;
  font: inherit;
}

button:hover, .active-button {
  background-color: #4caf50;
  color: #fff;
}

.fa-solid {
  padding-right: 0.5rem;
  font-size: 1.1rem;
}
</style>
