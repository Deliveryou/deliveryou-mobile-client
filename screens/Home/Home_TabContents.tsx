import { TabView } from '@rneui/themed'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import { bg_transparent, bg_warning, bg_white, flex_1, justify_center, px_10, size_fill, w_100 } from '../../stylesheets/primary-styles'
import HistoryTab from './HistoryTab/HistoryTab'
import HomeTab from './HomeTab/HomeTab'


interface TabViewsProps {
    value: number,
    onChange?: ((value: number) => any),
    navigation?: Object
}

export default function Home_TabContents(props: TabViewsProps) {
    console.log('render: tabviews')
    //const [disableTabSwipe, setDisableTabSwipe] = useState(false)

    return (
        <TabView
            value={props.value}
            onChange={props.onChange}
            animationType="spring"
            disableSwipe={true}
        >
            <TabView.Item style={[w_100, bg_transparent, flex_1]}>
                <HomeTab navigation={props.navigation} />
            </TabView.Item>
            <TabView.Item style={[w_100, bg_transparent]}>
                <HistoryTab />
            </TabView.Item>
            <TabView.Item style={[w_100, bg_transparent]}>
                <ScrollView
                    style={[size_fill, px_10, bg_warning]}
                    contentContainerStyle={[flex_1, justify_center]}>

                </ScrollView>
            </TabView.Item>
            <TabView.Item style={[w_100, bg_transparent]}>
                <ScrollView
                    style={[size_fill, px_10, bg_white]}
                    contentContainerStyle={[flex_1, justify_center]}>

                </ScrollView>
            </TabView.Item>
        </TabView>
    )
}