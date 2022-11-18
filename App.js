/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import RootRouter from './src/RootRouter';

import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import logger from 'redux-logger';
import thunk from "redux-thunk";
import * as reducers from './src/Redux/Reducers';

console.disableYellowBox = true

const reducer = combineReducers(reducers);

const store = createStore(
  reducer, composeWithDevTools(applyMiddleware(thunk, logger))
);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store} >
        <SafeAreaView
          style={styles.container}
          forceInset={{ bottom: 'always', top: 'never' }}>
          <RootRouter />
        </SafeAreaView>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})