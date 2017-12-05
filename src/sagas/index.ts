import { take, put, call, fork, select, all } from 'redux-saga/effects';

function* watchLoadMoreStargazers() {
  while (true) {
    const { fullName } = yield take('LOAD_MORE_STARGAZERS');
    yield fork(() => {}, fullName, true);
  }
}

function* root() {
  yield all([fork(watchLoadMoreStargazers)]);
}

export default root;
