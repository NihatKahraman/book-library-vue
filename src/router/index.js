import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

import { authRef } from "../firebase/config";
const requireAuth = (to, from, next) => {
  let user = authRef.currentUser
  if(!user) {
    next({ name: "login"})
  } else {
    next()
  } 
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: requireAuth,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import( '../views/About.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import( '../views/auth/Login.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import( '../views/auth/Signup.vue')
  },
  {
    path: '/books',
    name: 'books',
    beforeEnter: requireAuth,
    component: () => import( '../views/library/Books.vue')
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import( '../views/library/Customers.vue'),
    beforeEnter: requireAuth,
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: () => import( '../views/library/Reservations.vue'),
    beforeEnter: requireAuth,
  },
 
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
