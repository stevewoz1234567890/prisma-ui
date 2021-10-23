import { createAction, handleActions } from 'redux-actions';
import loglevel from 'loglevel';

const log = loglevel.getLogger('message');

export const handleSit915Message = sit915 => dispatch => {
  dispatch(updateStatus(sit915));
}

/** *************************************
 * Action Types
 ************************************* */
const LIST_MESSAGES = 'message/list';
const SET_CURRENT_MESSAGE = 'message/set-current-message';
const UPDATE_STATUS = 'message/update-status';

/** *************************************
 * Thunks
 ************************************* */
function createSit915MessageThunk(config) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      server.post(`/sit915/${config.comm_link_type}/${config.remotesite_id}`, config).then(
        json => {
          log.info('Created a new SIT 915 message', json);
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
}

function listMessagesThunk(sitNumber, direction, startDateTime, endDateTime) {
  return (dispatch, getState) => {
    const server = getState().server;

    return new Promise((resolve, reject) => {
      let params = {
        'sit-number': sitNumber,
        'direction': direction,
        'start-datetime': startDateTime,
        'end-datetime': endDateTime,
      };

      server.get('/message', params).then(
        json => {
          log.info('Got all SIT 185 & 915 messages', json);
          dispatch(listMessagesSuccess(json));
          resolve(json);
        },
        error => {
          reject(error);
        }
      );
    });
  };
};

/** *************************************
 * Action Creators
 ************************************* */
export const createSit915Message = createSit915MessageThunk;

export const listMessages = listMessagesThunk;
export const listMessagesSuccess = createAction(`${LIST_MESSAGES}`);

export const setCurrentMessage = createAction(`${SET_CURRENT_MESSAGE}`);

export const updateStatus = createAction(`${UPDATE_STATUS}`);

/** *************************************
 * Reducers
 ************************************* */
const initialState = {
  // List of all the SIT 185 & 915 messages
  messages: [],
  // Displaying message
  currentMessage: null,
};

const actionMap = {
  /** List SIT 185 & 915 messages */
  [listMessagesSuccess]: (state, action) => ({
    ...state,
    messages: action.payload,
  }),
  /** Set currentMessage to display the details */
  [setCurrentMessage]: (state, action) => ({
    ...state,
    currentMessage: action.payload,
  }),
  /** Update message status */
  [updateStatus]: (state, action) => {
    let payload = action.payload;
    let messages = state.messages;

    let idx = messages.findIndex(elem => {
      return elem.id = payload.id;
    });

    let buffMsg = { ...messages[idx] };

    switch (payload.status) {
      case 'SENT':
        buffMsg.Direction = 1;
        break;
      case 'PENDING':
        buffMsg.Direction = 3;
        break;
      case 'FAILED':
        buffMsg.Direction = 4;
        break;
    }
    buffMsg.CommLinkType = payload.commLinkType;

    let buffMessages = [...messages];

    buffMessages.splice(idx, 1, buffMsg);

    return {
      ...state,
      messages: buffMessages,
    };
  },
};

export const reducer = handleActions(
  {
    ...actionMap,
  },
  initialState,
);

export const init = store => {
  store.addReducer('message', reducer);
};