import { Global } from '../Global'
import { APIService } from './APIService'

export namespace ReportService {
    export namespace Types {
        export type ContributionGraphData = {
            date: string,
            count: number
        }

        export type MonthlyRevenue = {
            month: string,
            value: number
        }

        export type ShipperQuickReport = {
            packagesThisMonth: number
            allTimePackages: number
        }

        export type UserQuickReports = ShipperQuickReport & {
            allTimeSpending: number
            spendingThisMonth: number
        }
    }

    export namespace Shipper {

        export function packagesPerMonth(month: number, year: number, onSuccess: (list: Types.ContributionGraphData[]) => void, onError?: (error: any) => void) {
            const uploadObj = {
                shipperId: Global.User.CurrentUser.id,
                year,
                month
            }
            APIService.axios('/api/shipper/package/reports/packages-per-month', 'post', uploadObj)
                .then(response => response.data as Types.ContributionGraphData[])
                .then(list => onSuccess(list))
                .catch(error => onError?.(error))
        }

        export function revenuesOfMonths(months: string[], onSuccess: (list: Types.MonthlyRevenue[]) => void, onError?: (error: any) => void) {
            const uploadObj = {
                userId: Global.User.CurrentUser.id,
                months
            }
            APIService.axios('/api/shipper/package/reports/revenues-of-months', 'post', uploadObj)
                .then(response => response.data as Types.MonthlyRevenue[])
                .then(list => onSuccess(list))
                .catch(error => onError?.(error))
        }

        export function quickReports(onSuccess: (reports: Types.ShipperQuickReport) => void, onError?: (error: any) => void) {
            APIService.axios(`/api/shipper/package/reports/quick-reports/${Global.User.CurrentUser.id}`)
                .then(response => response.data as Types.ShipperQuickReport)
                .then(data => onSuccess(data))
                .catch(error => onError?.(error))
        }
    }

    export namespace User {
        export function quickReports(onSuccess: (reports: Types.UserQuickReports) => void, onError?: (error: any) => void) {
            APIService.axios(`/api/user/package/reports/quick-reports/${Global.User.CurrentUser.id}`)
                .then(response => response.data as Types.UserQuickReports)
                .then(data => onSuccess(data))
                .catch(error => onError?.(error))
        }
    }
}