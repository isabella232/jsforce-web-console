import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

const histories = handleActions({
  INPUT_COMMAND: (histories, { payload }) => {
    const history = { type: 'input', ...payload };
    return [ ...histories, history ];
  },
  OUTPUT_RESULT: (histories, { payload }) => {
    const history = { type: 'output', ...payload };
    return [ ...histories, history ];
  },
  OUTPUT_INFO: (histories, { payload: { data: message } }) => {
    const history = { type: 'log', level: 'info', message };
    return [ ...histories, history ];
  },
  OUTPUT_ERROR: (histories, { payload: { message, stack } }) => {
    const history = { type: 'log', level: 'error', message, stack };
    return [ ...histories, history ];
  },
  CLEAR_HISTORIES: () => {
    return [];
  },
}, []);

const loading = handleActions({
  LOADING_START: (loading) => {
    return true;
  },
  LOADING_END: (loading) => {
    return false;
  },
}, true);

const candidates = handleActions({
  INPUT_COMMAND: () => {
    return [];
  },
  COMPLETE: (completions, { payload }) => {
    return payload.candidates;
  },
}, []);

const cursor = handleActions({
  OUTPUT_RESULT: () => {
    return -1;
  },
  SET_CURSOR: (cursor, { payload }) => {
    return payload;
  },
  CLEAR_HISTORIES: () => {
    return -1;
  },
}, -1);

const prompt = handleActions({
  SET_PROMPT: (prompt, action) => {
    return action.payload;
  },
  COMPLETE: (prompt, { payload }) => {
    return payload.text;
  }
}, '');

const copyBuffer = handleActions({
  COPY_TEXT: (copyBuffer, action) => {
    return action.payload;
  },
  CLEAR_COPY_BUFFER: (copyBuffer) => {
    return null;
  },
}, null);

const visibleFrom = handleActions({
  CLEAR_LOGS: (visibleFrom, { payload }) => {
    console.log('CLEAR_LOGS', payload);
    return payload.histories.length;
  },
}, 0);

const rootReducer = combineReducers({
  histories,
  visibleFrom,
  loading,
  prompt,
  cursor,
  candidates,
  copyBuffer,
});

export default rootReducer;
