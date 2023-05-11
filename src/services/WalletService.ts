import { Global } from "../Global";
import { APIService } from "./APIService";
import { GraphQLService } from "./GraphQLService";

export namespace WalletService {

    export namespace Common {
        export function getWalletInfo(onSuccess: (wallet: GraphQLService.Type.Wallet) => void, onError?: (error: any) => void) {
            APIService.axios(`/api/wallet/shared/get-info/${Global.User.CurrentUser.id}`)
                .then(response => response.data as GraphQLService.Type.Wallet)
                .then(wallet => onSuccess(wallet))
                .catch(error => onError?.(error))
        }

        export function searchDriversWithPhone(phone: string, onSuccess: (list: GraphQLService.Type.User[]) => void, onError?: (error: any) => void) {
            APIService.axios(`/api/wallet/shared/drivers-with-phone/${phone}`)
                .then(response => response.data as GraphQLService.Type.User[])
                .then(list => onSuccess(list))
                .catch(error => onError?.(error))
        }

    }

    export namespace Shipper {
        export function giftCredits(senderWalletId: number, recipientId: number, amount: number, onSuccess: () => void, onError?: (error: any) => void) {
            const uploadObj = {
                senderWalletId,
                shipperId: Global.User.CurrentUser.id,
                recipientId,
                amount
            }
            APIService.axios('/api/wallet/shipper/gift-credits', 'post', uploadObj)
                .then(response => onSuccess())
                .catch(error => onError?.(error))
        }


        export function updateBankInfo(walletId: number, accountNumber: string, accountOwner: string, branch: string, onSuccess: (wallet: GraphQLService.Type.Wallet) => void, onError?: (error: any) => void) {
            const uploadObj = {
                walletId,
                accountNumber,
                accountOwner,
                branch
            }
            APIService.axios('/api/wallet/shipper/set-account-info', 'post', uploadObj)
                .then(response => response.data as GraphQLService.Type.Wallet)
                .then(data => onSuccess(data))
                .catch(error => onError?.(error))
        }
    }
}