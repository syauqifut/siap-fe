import api from '@/services/axios'
import type { ApiResponse } from '@/types/api'
import type { Dashboard, DashboardParams } from '@/types/dashboard'
import type {
  ReportDetail,
  ReportDetailParams,
  ReportSummary,
  ReportSummaryParams,
} from '@/types/report'

export const reportService = {
  async getDashboard(params: DashboardParams = {}): Promise<Dashboard> {
    const { data } = await api.get<ApiResponse<Dashboard>>(
      '/reports/dashboard',
      { params },
    )

    return data.data as Dashboard
  },

  async getSummary(params: ReportSummaryParams = {}): Promise<ReportSummary> {
    const { data } = await api.get<ApiResponse<ReportSummary>>(
      '/reports/summary',
      { params },
    )

    return data.data as ReportSummary
  },

  async getDetail(params: ReportDetailParams): Promise<ReportDetail> {
    const { data } = await api.get<ApiResponse<ReportDetail>>(
      '/reports/detail',
      { params },
    )

    return data.data as ReportDetail
  },
}
