import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '@/context/AuthContext'
import MainLayout from '@/layouts/MainLayout'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import ExpenseCategoryForm from '@/pages/expense-categories/ExpenseCategoryForm'
import ExpenseCategoryList from '@/pages/expense-categories/ExpenseCategoryList'
import ExpenseDetail from '@/pages/expenses/ExpenseDetail'
import ExpenseForm from '@/pages/expenses/ExpenseForm'
import ExpenseList from '@/pages/expenses/ExpenseList'
import BillDetail from '@/pages/bills/BillDetail'
import BillForm from '@/pages/bills/BillForm'
import BillList from '@/pages/bills/BillList'
import FeeTypeForm from '@/pages/fee-types/FeeTypeForm'
import FeeTypeList from '@/pages/fee-types/FeeTypeList'
import HouseDetail from '@/pages/houses/HouseDetail'
import HouseForm from '@/pages/houses/HouseForm'
import HouseList from '@/pages/houses/HouseList'
import PaymentDetail from '@/pages/payments/PaymentDetail'
import PaymentForm from '@/pages/payments/PaymentForm'
import PaymentList from '@/pages/payments/PaymentList'
import ReportDetail from '@/pages/reports/ReportDetail'
import ReportSummary from '@/pages/reports/ReportSummary'
import ResidentDetail from '@/pages/residents/ResidentDetail'
import ResidentForm from '@/pages/residents/ResidentForm'
import ResidentList from '@/pages/residents/ResidentList'
import ProtectedRoute from '@/routes/ProtectedRoute'
import ScrollToTop from '@/routes/ScrollToTop'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="residents" element={<ResidentList />} />
            <Route path="residents/new" element={<ResidentForm />} />
            <Route path="residents/:id" element={<ResidentDetail />} />
            <Route path="residents/:id/edit" element={<ResidentForm />} />

            <Route path="houses" element={<HouseList />} />
            <Route path="houses/new" element={<HouseForm />} />
            <Route path="houses/:id" element={<HouseDetail />} />
            <Route path="houses/:id/edit" element={<HouseForm />} />

            <Route path="bills" element={<BillList />} />
            <Route path="bills/new" element={<BillForm />} />
            <Route path="bills/:id" element={<BillDetail />} />

            <Route path="payments" element={<PaymentList />} />
            <Route path="payments/new" element={<PaymentForm />} />
            <Route path="payments/:id" element={<PaymentDetail />} />

            <Route path="expenses" element={<ExpenseList />} />
            <Route path="expenses/new" element={<ExpenseForm />} />
            <Route path="expenses/:id" element={<ExpenseDetail />} />

            <Route path="master-data/fee-types" element={<FeeTypeList />} />
            <Route path="master-data/fee-types/new" element={<FeeTypeForm />} />
            <Route
              path="master-data/fee-types/:id/edit"
              element={<FeeTypeForm />}
            />
            <Route
              path="master-data/expense-categories"
              element={<ExpenseCategoryList />}
            />
            <Route
              path="master-data/expense-categories/new"
              element={<ExpenseCategoryForm />}
            />
            <Route
              path="master-data/expense-categories/:id/edit"
              element={<ExpenseCategoryForm />}
            />

            <Route path="reports" element={<Navigate to="/reports/summary" replace />} />
            <Route path="reports/summary" element={<ReportSummary />} />
            <Route path="reports/detail" element={<ReportDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
