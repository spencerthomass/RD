/*!
=========================================================
* © 2024 Ronan LE MEILLAT for SCTG Development
=========================================================
This website use:
- Vite, Vue3, FontAwesome 6, TailwindCss 3
- And many others
*/
import { createApp } from 'vue'
import App from '@/App.vue'
import { createWebHistory, createRouter, RouteRecordRaw, NavigationGuardNext } from "vue-router"
import { createPinia } from 'pinia'
import { addJsonLD } from "./config/StructuredLDJson"
import { useUserStore } from '@/stores/sctgDeskStore';
import '@/index.scss'
import { RouteLocationNormalized } from 'vue-router'
import { useVersionsStore } from '@/stores/versionsStore';

/**
 * The routes of the application.
 */
const routes = [
    {
        path: "/ui/index",
        component: () => import("@/layouts/AppShell.vue"),
        name: 'index',
        redirect: { name: 'dashboard' },
        children: [
            { path: "/ui/dashboard", name: 'dashboard', component: () => import("@/views/DashboardPage.vue"), meta: { title: 'Dashboard' } },
            { path: "/ui/devices", name: 'devices', component: () => import("@/views/DevicesPage.vue"), meta: { title: 'Devices' } },
            { path: "/ui/users", name: 'users', component: () => import("@/views/UsersPage.vue"), meta: { title: 'Users' } },
            { path: "/ui/groups", name: 'groups', component: () => import("@/views/GroupsPage.vue"), meta: { title: 'Groups' } },
            { path: "/ui/address-books", name: 'address-books', component: () => import("@/views/AddressBooksPage.vue"), meta: { title: 'Address books' } },
            { path: "/ui/settings", name: 'settings', component: () => import("@/views/SettingsPage.vue"), meta: { title: 'Settings' } },
        ],
    },
    {
        path: "/ui/login",
        component: () => import("@/views/LoginPage.vue"),
        name: 'login',
    },
    {
        path: "/:pathMatch(.*)*",
        name: 'default',
        redirect: "/ui/login"
    },
] as RouteRecordRaw[]


const router = createRouter({
    /**
     * Determines the scroll behavior for a given route.
     *
     * @param {RouteLocationNormalized} to - The route object containing information about the destination route.
     * @return {{ el: string } | undefined}- A promise that resolves to an object with the element to scroll to, or undefined if no hash is present in the route.
     */
    scrollBehavior(to: RouteLocationNormalized): { el: string } | undefined {
        if (to.hash) {
            return {
                el: to.hash,
            }
        }
    },
    history: createWebHistory(),
    routes,
});

/**
 * The navigation guard for the application.
 */
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const store = useUserStore();
    if (to.name !== 'login' && !store.user && !store.api_configuration) {
        next({ name: 'login' });
    } else {
        next();
    }
});

/**
 * The Pinia store for the application.
 */
const pinia = createPinia()

/**
 * The application instance.
 */
createApp(App).use(router)
    .use(pinia)
    .mount('#app')
addJsonLD();

/**
 * Fetches the versions into the main pinia store.
 */
useVersionsStore().fetchVersions();