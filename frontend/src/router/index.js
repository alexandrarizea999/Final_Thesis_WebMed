import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import DoctorDashboard from '../views/DoctorDashboard.vue'
import ProfileDashboard from '../views/ProfileDashboard.vue'
import ConfirmAppointmentView from '../views/ConfirmAppointmentView.vue'
import PatientTestsView from '../views/PatientTestsView.vue'
import AccessTestView from '../views/AccessTestView.vue'
import AddMedicalRecordView from '../views/AddMedicalRecordView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import DispecerDashboard from '../views/DispecerDashboard.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/profile',
    name: 'profile',
    redirect: to => {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (user?.role === 'admin') {
        return '/admin-dashboard';
      } else if (user?.role === 'doctor') {
        return '/doctor-dashboard';
      } else if (user?.role === 'dispecer') {
        return '/dispecer-dashboard';
      } else {
        return '/profile-dashboard';
      }
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/profile-dashboard',
    name: 'profile-dashboard',
    component: ProfileDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor-dashboard',
    name: 'doctor-dashboard',
    component: DoctorDashboard,
    meta: { requiresAuth: true, roles: ['doctor'] }
  },
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/dispecer-dashboard',
    name: 'dispecer-dashboard',
    component: DispecerDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/confirmare-programare',
    name: 'confirm-appointment',
    component: ConfirmAppointmentView
  },
  {
    path: '/medical-tests',
    name: 'medical-tests',
    component: PatientTestsView,
    meta: { requiresAuth: true, roles: ['patient'] }
  },
  {
    path: '/access-test',
    name: 'access-test',
    component: AccessTestView
  },
  {
    path: '/add-medical-record',
    name: 'add-medical-record',
    component: AddMedicalRecordView,
    meta: { requiresAuth: true, roles: ['doctor'] }
  }
]
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/', '/confirmare-programare', '/access-test'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  if (loggedIn && publicPages.includes(to.path)) {
    return redirectToDashboard(user, next);
  }
  if (authRequired && !loggedIn) {
    return next('/login');
  }
  if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
    return redirectToDashboard(user, next);
  }
  next();
});
function redirectToDashboard(user, next) {
  switch (user?.role) {
    case 'admin':
      return next('/admin-dashboard');
    case 'doctor':
      return next('/doctor-dashboard');
    case 'dispecer':
      return next('/dispecer-dashboard');
    default:
      return next('/profile-dashboard');
  }
}
export default router 