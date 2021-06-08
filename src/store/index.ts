import { createStore } from 'redux';
import { ActionTypes } from 'types/storeTypes';

type ActionType = {
  type: ActionTypes,
  userName?: string,
  curTitle?: string
};

const reducer = (state: any, action: ActionType) => {
  switch (action.type) {
    case ActionTypes.login:
      return { ...state, userName: action.userName };
    case ActionTypes.changeArticle:
      return { ...state, curTitle: action.curTitle };
    default:
      return {};
  }
};

const store = createStore(reducer);

export default store;