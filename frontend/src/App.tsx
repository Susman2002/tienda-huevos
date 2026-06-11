import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SuppliersPage from './pages/suppliers/SuppliersPage'
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage'
import OrderDetailPage from './pages/suppliers/OrderDetailPage'
import ProductsPage from './pages/products/ProductsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import StockPage from './pages/stock/StockPage'
import StockMovementsPage from './pages/stock/StockMovementsPage'
import CustomersPage from './pages/customers/CustomersPage'
import CustomerDetailPage from './pages/customers/CustomerDetailPage'
import WholesaleSalesPage from './pages/wholesale-sales/WholesaleSalesPage'
import SaleDetailPage from './pages/wholesale-sales/SaleDetailPage'
import CreateSalePage from './pages/wholesale-sales/CreateSalePage'
import ReportsPage from './pages/ReportsPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegidas con layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="suppliers/:id" element={<SupplierDetailPage />} />
          <Route path="suppliers/orders/:id" element={<OrderDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="stock/:productId/movements" element={<StockMovementsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="wholesale-sales" element={<WholesaleSalesPage />} />
          <Route path="wholesale-sales/create" element={<CreateSalePage />} />
          <Route path="wholesale-sales/:id" element={<SaleDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Solo ADMIN */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}