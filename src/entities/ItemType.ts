export default class ItemType {
    static readonly Food: ItemTypeDetails = {
        name: 'Food',
        iconName: 'fast-food-outline',
        iconType: 'ionicon'
    }
    static readonly Clothing: ItemTypeDetails = {
        name: 'Clothing',
        iconName: 'shirt-outline',
        iconType: 'ionicon'
    }
    static readonly Electronics: ItemTypeDetails = {
        name: 'Electronics',
        iconName: 'ios-phone-portrait-outline',
        iconType: 'ionicon'
    }
    static readonly Fragile: ItemTypeDetails = {
        name: 'Fragile',
        iconName: 'warning',
        iconType: 'antdesign'
    }
    static readonly Other: ItemTypeDetails = {
        name: 'Other',
        iconName: 'more-horizontal',
        iconType: 'feather'
    }
}

export interface ItemTypeDetails {
    name: string,
    iconName?: string,
    iconType?: string
}