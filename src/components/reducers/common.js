import {object} from "prop-types";

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
        },
        isLoaded: false,
        error: false,
    },
    centrifuge: {
        object: null
    },
    history: {
        path: null,
        id: null
    },
    components: {
        settings: {
            main_page: true,
            messenger: true,
            feed: true
        }
    },
    webRTC: {
        pc: null
    },
    status_call: "connecting",
    call: {
        state: false,
        audio: null
    },
    stream: null,
    am: false,
    people: [],
    notification_user: {},
    feed_rewrite: {
        rewriteUUID: null,
        rewriteValue: null,
        rewriteTitle: null,
        rewriteMode: false,
        privatePost: false,
        showPreview: false,
        coverUpload: null,
        videoUpload: null,
        useTags: []
    }
}

export default function AppReducer(state = initialState, action) {

    switch (action.type) {
        case "ACTION_UPDATE_HISTORY":
            state.history = action.value
            return state
        case "ACTION_CHECK_AUTH":
            state.auth = action.value
            return state
        case "ACTION_SET_CENTRIFUGE":
            state.centrifuge = action.value
            return state
        case "ACTION_SET_COMPONENTS":
            state.components = action.value
            return state
        case "ACTION_SET_WEBRTC":
            state.webRTC = action.value
            return state
        case "ACTION_SET_CALL":
            state.call = action.value
            return state
        case "ACTION_SET_STATUS_CALL":
            state.status_call = action.value
            return state
        case "ACTION_SET_STREAM":
            state.stream = action.value
            return state
        case "ACTION_SET_AM":
            state.am = action.value
            return state
        case "ACTION_UPDATE_PEOPLE":
            state.people = action.value
            return state
        case "ACTION_UPDATE_NOTIFICATION_USER":
            state.notification_user = action.value
            return state
        case "ACTION_UPDATE_FEED_REWRITE":
            state.feed_rewrite = action.value
            return state
        default:
            return state
    }
}

