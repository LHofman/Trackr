import React, { Component } from 'react';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';
import ItemForm from './ItemForm';

export default class EditItem extends Component {
  constructor() {
    super();
    this.state = {
      id: null
    }
  }

  editItem(newItem) {
    return fetch(`/api/items/${this.state.id}`, 'put', true, newItem);
  }

  getItemDetails() {
    return new Promise((resolve) => {
      const title_id = this.props.match.params.titleId;
      return fetch(`/api/items/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({ id: details._id});
          resolve({ details });
        } else {
          resolve({ redirect: `/items/${title_id}` });
        }
      }).catch((reason) => { resolve({ redirect: '/' }) });
    })
  }

  render() {
    return (
      <ItemForm
        title='Edit Item'
        getDetails={ this.getItemDetails.bind(this) }
        submitButtonText='Save Item'
        updateItem={ this.editItem.bind(this) } />
    );
  }
}