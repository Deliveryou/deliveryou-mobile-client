import { TabView } from '@rneui/themed'
import { useState, useRef } from 'react'
import { ScrollView } from 'react-native'
import { Global } from '../../Global'
import { bg_transparent, bg_warning, bg_white, flex_1, justify_center, px_10, size_fill, w_100 } from '../../stylesheets/primary-styles'
import ActivityTab from './Common/Acitivity/ActivityTab'
import ChatTab from './RegularUser/ChatTab/ChatTab'
import RegularUserHomeTab from './RegularUser/HomeTab/HomeTab'
import ShipperHomeTab from './Shipper/HomeTab/HomeTab'
import ShipperProfileTab from './Shipper/ProfileTab/ProfileTab'
import UserProfileTab from './RegularUser/ProfileTab/ProfileTab'

interface TabViewsProps {
    value: number,
    onChange?: ((value: number) => any),
    navigation: Object,
    route: Object,
    userType: Global.User.Type.REGULAR_USER | Global.User.Type.SHIPPER
}

export default function MainTabContainer(props: TabViewsProps) {

    return (
        <TabView
            value={props.value}
            onChange={props.onChange}
            animationType="spring"
            disableSwipe={true}
        >
            <TabView.Item style={[w_100, bg_transparent, flex_1]}>
                {
                    (props.userType === Global.User.Type.REGULAR_USER) ?
                        <RegularUserHomeTab
                            navigation={props.navigation}
                            route={props.route}
                        />
                        :
                        <ShipperHomeTab
                            navigation={props.navigation}
                            route={props.route}
                        />
                }
            </TabView.Item>
            <TabView.Item style={[w_100, bg_transparent]}>
                <ActivityTab />
            </TabView.Item>
            {
                (props.userType === Global.User.Type.REGULAR_USER) ?
                    <TabView.Item style={[w_100, bg_transparent]}>
                        <ChatTab
                            navigation={props.navigation}
                            route={props.route}
                        />
                    </TabView.Item> : null
            }
            <TabView.Item style={[w_100, bg_transparent]}>
                {
                    (props.userType === Global.User.Type.REGULAR_USER) ?
                        <UserProfileTab
                            navigation={props.navigation}
                            route={props.route}
                        />
                        :
                        <ShipperProfileTab
                            navigation={props.navigation}
                            route={props.route}
                        />
                }
            </TabView.Item>
        </TabView>
    )
}