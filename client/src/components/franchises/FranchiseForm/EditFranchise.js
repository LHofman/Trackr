import React, { Component } from 'react';

import FranchiseForm from './FranchiseForm';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';

export default class EditFranchise extends Component {
  constructor() {
    super();
    this.state = {
      id: null,
      title_id: null
    }
  }

  editFranchise(newFranchise) {
    return fetch(`/api/franchises/${this.state.id}`, 'put', true, newFranchise);
  }

  getFranchiseDetails() {
    return new Promise((resolve) => {
      const title_id = this.props.match.params.titleId;
      return fetch(`/api/franchises/title_id/${title_id}`).then(details => {
        if (canEdit(details)) {
          this.setState({ id: details._id, title_id: details.title_id });
          resolve({ details });
        } else {
          resolve({ redirect: `/franchises/${title_id}` });
        }
      }).catch((reason) => { resolve({ redirect: '/' }) });
    });
  }

  render() {
    return (
      <FranchiseForm
        title='Edit Franchise'
        getDetails={ this.getFranchiseDetails.bind(this) }
        submitButtonText='Save Franchise'
        updateFranchise={ this.editFranchise.bind(this) }
        cancelUrl={`/franchises/${this.state.title_id}`} />
    );
  }
}
