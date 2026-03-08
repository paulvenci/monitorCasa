import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
    },
    {
        path: '/energia',
        name: 'Energia',
        component: () => import('../views/Energia.vue'),
    },
    {
        path: '/agua',
        name: 'Agua',
        component: () => import('../views/Agua.vue'),
    },
    {
        path: '/eventos',
        name: 'Eventos',
        component: () => import('../views/Eventos.vue'),
    },
    {
        path: '/configuracion',
        name: 'Configuracion',
        component: () => import('../views/Configuracion.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
