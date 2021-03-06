import { createAction } from 'redux-actions';

function doAction(type, payload) {
  return createAction(type)(payload);
}

function isPromiseLike(o) {
  return typeof o === 'object' && o !== null && typeof o.then === 'function';
}

export function createReplActions(evaluator) {

  const ac = {

    init() {
      return (dispatch) => {
        dispatch(doAction('LOADING_START'));
        const result = evaluator.init();
        if (isPromiseLike(result)) {
          result.then((value) => {
            dispatch(doAction('LOADING_END'));
            dispatch(doAction('OUTPUT_INFO', { data: value }));
          });
        } else {
          dispatch(doAction('LOADING_END'));
          dispatch(doAction('OUTPUT_INFO', { data: result }));
        }
      }
    },

    requestComplete(text, pos) {
      console.log('requestComplete', text, pos);
      const result = evaluator.complete(text, pos);
      return doAction('COMPLETE', result);
    },

    requestEvaluate(text) {
      console.log('requestEvaluate', text);
      return (dispatch) => {
        dispatch(doAction('SET_PROMPT', ''));
        dispatch(doAction('INPUT_COMMAND', { data: text }));
        dispatch(doAction('LOADING_START'));
        try {
          const { type, result, seq } = evaluator.evaluate(text);
          if (type === 'CLEAR_LOGS') {
            dispatch(doAction('LOADING_END'));
            dispatch(ac.clearLogs());
          } else if (isPromiseLike(result)) {
            result.then((value) => {
              dispatch(doAction('LOADING_END'));
              dispatch(doAction(`OUTPUT_${type}`, { data: value, seq }));
            }, (err) => {
              dispatch(doAction('LOADING_END'));
              dispatch(doAction('OUTPUT_ERROR', err));
            });
          } else {
            dispatch(doAction('LOADING_END'));
            dispatch(doAction(`OUTPUT_${type}`, { data: result, seq }));
          }
        } catch (err) {
          dispatch(doAction('LOADING_END'));
          dispatch(doAction('OUTPUT_ERROR', err));
        }
      };
    },

    goBackInHistory() {
      return (dispatch, getState) => {
        let { cursor, histories } = getState();
        let history, idx;
        if (cursor < 0) { cursor = histories.length; }
        for (idx = cursor-1; idx >= 0; idx--) {
          console.log('history = ', h);
          let h = histories[idx];
          if (h.type === 'input') {
            history = h;
            break;
          }
        }
        cursor = history ? idx : 0;
        let prompt = history ? history.data : '';
        dispatch(doAction('SET_CURSOR', cursor));
        dispatch(doAction('SET_PROMPT', prompt));
      };
    },

    goForwardInHistory() {
      return (dispatch, getState) => {
        let { cursor, histories } = getState();
        let history, idx;
        if (cursor < 0) { cursor = histories.length; }
        for (idx = cursor+1; idx < histories.length; idx++) {
          let h = histories[idx];
          if (h.type === 'input') {
            history = h;
            break;
          }
        }
        cursor = history ? idx : -1;
        let prompt = history ? history.data : '';
        dispatch(doAction('SET_CURSOR', cursor));
        dispatch(doAction('SET_PROMPT', prompt));
      };
    },

    copyText(text) {
      if (typeof text !== 'string') {
        try {
          text = JSON.stringify(text);
        } catch(e) {}
      }
      return doAction('COPY_TEXT', text);
    },

    clearCopyBuffer() {
      return doAction('CLEAR_COPY_BUFFER');
    },

    clearLogs() {
      return (dispatch, getState) => {
        const state = getState();
        dispatch(doAction('CLEAR_LOGS', { histories: state.histories }));
      };
    },

    outputLog(v) {
      return doAction('OUTPUT_RESULT', { data: v });
    }

  };

  return ac;
}
