import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'
import HospitalList from '../components/hospital/HospitalList.vue'
import DoctorList from '../components/doctor/DoctorList.vue'
import DepartmentList from '../components/department/DepartmentList.vue'
import SpecimenList from '../components/specimen/SpecimenList.vue'
import ReportList from '../components/report/ReportList.vue'
import UserList from '../components/user/UserList.vue'
import RoleList from '../components/role/RoleList.vue'
import ManagerList from '../components/manager/ManagerList.vue'
import Login from '../components/Login.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/home',
    component: Home,
    children: [{
      path: '/hospitals',
      component: HospitalList
    }, {
      path: '/doctors',
      component: DoctorList
    }, {
      path: '/departments',
      component: DepartmentList
    }, {
      path: '/specimens',
      component: SpecimenList
    }, {
      path: '/report',
      component: ReportList
    }, {
      path: '/managers',
      component: ManagerList
    }, {
      path: '/users',
      component: UserList
    }, {
      path: '/roles',
      component: RoleList
    }]
  },
  {
    path: '/login',
    component: Login
  }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const loginName = window.sessionStorage.getItem('loginName')
  const rightList = JSON.parse(window.sessionStorage.getItem('rightList'))
  /// 拦截访问hospitals的权限
  if (to.path === '/hospitals' && ((rightList || {}).hospitalManagement || {}).hospitalAction === undefined) {
    return next(from.path)
  }
  if (to.path === '/departments' && ((rightList || {}).hospitalManagement || {}).departmentAction === undefined) {
    return next(from.path)
  }
  if (to.path === '/doctors' && ((rightList || {}).hospitalManagement || {}).doctorAction === undefined) {
    return next(from.path)
  }
  if (to.path === '/specimens' && ((rightList || {}).specimenManagement || {}).specimenAction === undefined) {
    return next(from.path)
  }
  if (to.path === '/specimens' && ((rightList || {}).specimenManagement || {}).specimenAction === undefined) {
    return next(from.path)
  }
  if (to.path === '/users' && ((rightList || {}).userManagement || {}).userAction === undefined) {
    return next(from.path)
  }
  if (to.path === '/roles' && ((rightList || {}).roleManagement || {}).roleAction === undefined) {
    return next(from.path)
  }
  if (!loginName) return next('/login')
  next()
})
export default router
