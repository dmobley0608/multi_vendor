import './App.css'
import Login from './pages/Login'
import { Routes, Route, useNavigate } from 'react-router'
import StaffLayout from './pages/staff/StaffLayout.jsx'
import VendorDashboard from './pages/vendors/VendorDashboard.jsx'


import Vendors from './pages/staff/vendors/Vendors.jsx'
import CashRegister from './pages/staff/CashRegister.jsx'
import VendorDetails from './pages/staff/vendors/VendorDetails.jsx'
import PrintInvoice from './pages/staff/PrintInvoice.jsx'
import MonthlySalesSummary from './pages/staff/reports/MonthlySalesSummary.jsx'
import { AuthProvider, RequireAdmin, RequireAuth } from './context/authContext.jsx'
import Dashboard from './components/staff/Dashboard.jsx'
import Settings from './pages/staff/Settings.jsx'
import { useGetSettingsQuery } from './services/Api.js'
import Transactions from './pages/staff/Transactions.jsx'
import MonthlySalesReport from './pages/staff/reports/MonthlySalesReport.jsx'
import TopTen from './pages/staff/reports/TopTen.jsx'
import Messages from './components/messages/MessagesLayout.jsx'
import { LoadingProvider } from './context/loadingContext';
import VendorMonthlyReport from './pages/staff/reports/VendorMonthlyReport.jsx'

function App() {
  const { data: settings } = useGetSettingsQuery()


  document.title = settings?.find(setting => setting.key === 'Store_Name')?.value || 'POS System'

  return (
    <>
      {/* <div id="banner" className='bg-secondary text-light p-0 mb-2'>
        <h6>Under Development</h6>
        Updated 2/26/2025 @ 7:45p.m
        <div className='row px-5'>
          <div className='col-6'>
            <h6 className='text-start'>Admin Username: mdobbs</h6>
            <h6 className='text-start'>Password: ThePassword123!</h6>
          </div>
          <div className='col-6'>
            <h6 className='text-end'>Vendor Username: First Initial Last Name: ie. hpotter</h6>
            <h6 className='text-end'> Default Password: username + 123! ie. hpotter123!</h6>
          </div>
        </div>
      </div> */}
      <LoadingProvider>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='staff' element={<RequireAdmin><StaffLayout /></RequireAdmin>}>
              <Route index path='dashboard' element={<Dashboard />} />
              <Route index path='cash-register' element={<CashRegister />} />
              <Route path='vendors' element={<Vendors />} />
              <Route path='vendors/:id' element={<VendorDetails />} />
              <Route path='messages' element={<Messages />} />
              <Route path='monthly-sales-summary' element={<MonthlySalesSummary />} />
              <Route path='settings' element={<Settings />} />
              <Route path='transactions' element={<Transactions />} />
              <Route path='top-10' element={<TopTen />} />
            </Route>
            <Route path='/staff/print-invoice/:id' element={<RequireAdmin><PrintInvoice /></RequireAdmin>} />
            <Route path='/staff/reports/monthly/:year/:month' element={<RequireAdmin><MonthlySalesReport /></RequireAdmin>} />
            <Route path= "/staff/reports/monthly/vendor/:year/:month/:vendorId" element={<RequireAdmin><VendorMonthlyReport /></RequireAdmin>} />
            <Route path='/vendor' element={<RequireAuth><VendorDashboard /></RequireAuth>} />
            <Route path='login' element={<Login />} />


          </Routes>
        </AuthProvider>
      </LoadingProvider>
    </>
  )
}

export default App
