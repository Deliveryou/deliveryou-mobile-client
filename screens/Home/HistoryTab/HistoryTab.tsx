import { View, ScrollView } from 'react-native';
import React, { } from 'react'
import { bg_white, flex_1, justify_center, px_10, size_fill } from '../../../stylesheets/primary-styles';

export default function HistoryTab() {
    return (
        <ScrollView
            style={[size_fill, px_10, bg_white]}
            contentContainerStyle={[flex_1, justify_center]}>

        </ScrollView>
    )
}
