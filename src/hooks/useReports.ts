import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { reportService } from '@/services/reportService'
import type { DashboardParams } from '@/types/dashboard'
import type { ReportDetailParams, ReportSummaryParams } from '@/types/report'

export function useDashboard(params: DashboardParams = {}) {
  return useQuery({
    queryKey: ['reports', 'dashboard', params],
    queryFn: () => reportService.getDashboard(params),
    placeholderData: keepPreviousData,
  })
}

export function useReportSummary(params: ReportSummaryParams = {}) {
  return useQuery({
    queryKey: ['reports', 'summary', params],
    queryFn: () => reportService.getSummary(params),
    placeholderData: keepPreviousData,
  })
}

export function useReportDetail(params: ReportDetailParams) {
  return useQuery({
    queryKey: ['reports', 'detail', params],
    queryFn: () => reportService.getDetail(params),
    placeholderData: keepPreviousData,
    enabled: Boolean(params.month),
  })
}
