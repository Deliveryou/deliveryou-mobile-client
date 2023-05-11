import {
    useSendbirdChat,
    createGroupChannelListFragment,
    createGroupChannelCreateFragment,
    createGroupChannelFragment,
    GroupChannelListContexts,
    GroupChannelListModule,
    GroupChannelListFragment,
    GroupChannelListProps
} from '@sendbird/uikit-react-native';


export function GroupChannelList(initModule?: Partial<GroupChannelListModule>) {
    const GroupChannelListFragment = createGroupChannelListFragment();

    type Extra = { route?: any, navigation?: any }

    return function Fragment(props: GroupChannelListProps['Fragment'] & Extra) {
        return (
            <GroupChannelListFragment
                {...props}
            />
        )
    }
}

