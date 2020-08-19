import React, { Component } from 'react';
import ItemForm from './ItemForm';

import fetch from '../../../utils/fetch';

export default class AddItem extends Component {
  addItem(newItem) {
    return fetch('/api/items', 'post', true, newItem);
  }

  render() {
    return (
      <ItemForm
        title='Add Item'
        submitButtonText='Create Item'
        updateItem={ this.addItem.bind(this) } />
    );
  }
}