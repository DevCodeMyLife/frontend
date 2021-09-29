const initialState = {
    auth: {
        user: {
            isAuth: false,
            data: null,
            feeds: null,
            notificationCount: 0,
            messagesCount: 0,
            notifications: null,
            token: null,
            error: null
        }
    },
    centrifuge: {
        object: null
    }
}

export default function AppReducer(state = initialState, action) {

    switch (action.type) {
        case "ACTION_CHECK_AUTH":
            state.auth = action.value
            return state
        case "ACTION_SET_CENTRIFUGE":
            state.centrifuge = action.value
            return state
        default:
            return state
    }
}

