// Dependencies
import React from 'react'
import { Fragment } from 'react'
import { Routes, Route, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import Scan from './pages/admin/scan'
import MasterLayout from './components/admin/layout/master-layout'
import SearchBooks from './pages/client/get-book'
import ManageRequests from './pages/admin/manage-request'
import ClientLanding from './pages/client/home'
import AdminLanding from './components/admin/admin-home'
import MyBookRequests from './pages/client/my-request'
import BookBarcode from './components/admin/book-barcode'
import BookDetails from './components/admin/book-details'
import LibraryDashboard from './pages/admin/live-library'
import Login from './pages/client/login'
import ScanRFID from './pages/client/scan-rfid'
import VerifyPage from './pages/admin/verification'
import ProfilePage from './pages/client/profile'

// Layouts


const App = () => {

  // Hooks
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Constants
  const NoNavbarRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const NoFooterRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

  // Roles 
  const isAdmin = true;

  return (
    <Fragment>
      {/* Conditional Rendering for Navbar Based On Individuals Roles*/}
      {/* {isAdmin ?
        !NoNavbarRoutes.includes(location.pathname) && (<AdminNavabr />)
        : !NoNavbarRoutes.includes(location.pathname) && (<ClientNavbar />)
      } */}

      <Routes>
        {/* Student Routes */}
        <Route exact path='/' element={<ClientLanding />} />
        <Route exact path='/search' element={<SearchBooks />} />
        <Route exact path='/my-request' element={<MyBookRequests />} />
        <Route exact path='/login' element={<Login />} />
        <Route exact path='/scan-rfid' element={<ScanRFID />} />
        <Route exact path='/profile' element={<ProfilePage />} />


        {/* Admin Routes Under Admin Layout*/}
        <Route path="/admin" element={<MasterLayout />}>
          <Route index element={<AdminLanding />} />
          <Route path="scan" element={<Scan />} />
          <Route path="shelf" element={<BookBarcode />} />
          <Route path="requests" element={<ManageRequests />} />
          <Route path="twins" element={<LibraryDashboard />} />
          <Route path="verify" element={<VerifyPage />} />
        </Route>


        <Route path="/admin/book-details/:id" element={<BookDetails />} />
      </Routes>

      {/* Conditional Rendering for Footer Based On Individuals Roles*/}
      {/* {isAdmin ?
        !NoNavbarRoutes.includes(location.pathname) && (<AdminFooter />)
        : !NoNavbarRoutes.includes(location.pathname) && (<ClientFooter />)
      } */}
    </Fragment>
  )
}

export default App
