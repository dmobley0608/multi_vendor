import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/Login'
import { Routes, Route, useNavigate } from 'react-router'
import StaffDashboard from './pages/staff/StaffDashboard.jsx'
import VendorDashboard from './pages/vendors/VendorDashboard.jsx'
import { useGetUserQuery } from './services/UserApi.js'
import TopNavbar from './components/TopNavbar.jsx'
import Homepage from './pages/Homepage.jsx'
import { useSelector } from 'react-redux'
import Vendors from './pages/staff/vendors/Vendors.jsx'
import CashRegister from './pages/staff/CashRegister.jsx'
import VendorDetails from './pages/staff/vendors/VendorDetails.jsx'
import PrintInvoice from './pages/staff/PrintInvoice.jsx'
import Messages from './components/vendorDashboard/VendorMessages.jsx'
import Reports from './pages/staff/reports/Reports.jsx'
import MonthlyReport from './components/reports/MonthlyReport.jsx'
import UserProfile from './pages/UserProfile.jsx'

function App() {
  const { data: user, isLoading, error } = useGetUserQuery()
  const [token, setToken] = useState(localStorage.getItem('token'))
  const nav = useNavigate()

  const EmployeeAuth= ({children}) => {
    if (user?.is_staff) {
      return children
     }else{
     return <Login/>
     }
  }

  return (
    <>

      {isLoading ? "Loading" :
      <>
      {error?.status === 'FETCH_ERROR' && <small className='text-danger'>Looks like there is an issue with the server. Please try again later.</small>}
        <Routes>
          <Route path='/' element={<Homepage user={user}/>}/>
            <Route path='staff' element={<EmployeeAuth><StaffDashboard /></EmployeeAuth>}>
              <Route index path='cash-register' element={<CashRegister />} />
              <Route path='vendors' element={<Vendors />} />
              <Route path='vendors/:id' element={<VendorDetails/>}/>
              <Route path='messages' element={<Messages/>}/>
              <Route path='reports' element={<Reports/>}/>
              <Route path='monthly-report' element={<MonthlyReport />} />
              <Route path='profile' element={<UserProfile />} />

            </Route>
            <Route path='/vendor' element={<VendorDashboard />} />
            <Route path='login' element={<Login />} />
            <Route path='/print-invoice/:id' element={<PrintInvoice />} />
        </Routes>
        </>
      }
    </>
  )
}

export default App
