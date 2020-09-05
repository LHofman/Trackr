import React, { Component } from 'react';

import ListForm from './ListForm';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';

export default class EditList extends Component {
  constructor() {
    super();
    this.state = {
      id: null
    }
  }

  editList(newList) {
    return fetch(`/api/lists/${this.state.id}`, 'put', true, newList);
  }

  getListDetails() {
    return new Promise((resolve) => {
      const title_id = this.props.match.params.titleId;
      return fetch(`/api/lists/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({ id: details._id});
          resolve({ details });
        } else {
          resolve({ redirect: `/lists/${title_id}` });
        }
      }).catch((reason) => { resolve({ redirect: '/' }) });
    });
  }

  render() {
    return (
      <ListForm
        title='Edit List'
        getDetails={ this.getListDetails.bind(this) }
        submitButtonText='Save List'
        updateList={ this.editList.bind(this) } />
    );
  }
}
