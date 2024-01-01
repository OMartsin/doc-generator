import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'invoices',
      component: () => import('../views/InvoiceGenerator.vue')
    }
  ]
})

export default router
