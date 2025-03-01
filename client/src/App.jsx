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
import ConsentPopup from './components/ConsentPopup'
import Swal from 'sweetalert2'
import SeedDatabase from './components/SeedDatabase'
import useGitHubLastUpdate from './hooks/useGitHubLastUpdate'

function App() {
  const { data: settings } = useGetSettingsQuery()
  const lastUpdate = useGitHubLastUpdate('dmobley0608', 'multi_vendor')

  document.title = settings?.find(setting => setting.key === 'Store_Name')?.value || 'POS System'

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <>
      <div id="banner" className='bg-dark text-light p-0 mb-2'>
        <h6>DEMONSTRATION PURPOSES ONLY</h6>
        Updated {formatDate(lastUpdate)}
        <div className='row px-5'>
          <div className='col-6'>
            <h6 className='text-start'>Admin Username: staffMember</h6>
            <h6 className='text-start'>Password: Password123</h6>
          </div>

          <div className='col-6'>
            <h6 className='text-end'>Vendor Username: First Initial Last Name: ie. hpotter</h6>
            <h6 className='text-end'> Default Password: username + 123! ie. hpotter123!</h6>
          </div>
        </div>
      </div>
      <LoadingProvider>
        <AuthProvider>
          <ConsentPopup />
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
            <Route path="/staff/reports/monthly/vendor/:year/:month/:vendorId" element={<RequireAdmin><VendorMonthlyReport /></RequireAdmin>} />
            <Route path='/vendor' element={<RequireAuth><VendorDashboard /></RequireAuth>} />
            <Route path='login' element={<Login />} />


          </Routes>
        </AuthProvider>
      </LoadingProvider>
    </>
  )
}

export default App
