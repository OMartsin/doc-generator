import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'invoices',
      component: () => import('../views/InvoiceGenerator.vue')
    },
    {
      path: '/acts',
      name: 'acts',
      component: () => import('../views/ActGenerator.vue')
    }
  ]
})

export default router
