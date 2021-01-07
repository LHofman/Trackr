import React, { Component } from 'react';

import ListForm from './ListForm';

import fetch from '../../../utils/fetch';

export default class AddList extends Component {
  addList(newList) {
    return fetch('/api/lists', 'post', true, newList);
  }

  render() {
    return (
      <ListForm
        title='Add List'
        submitButtonText='Create List'
        updateList={ this.addList.bind(this) } />
    );
  }
}
