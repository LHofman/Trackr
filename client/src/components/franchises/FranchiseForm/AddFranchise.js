import React, { Component } from 'react';

import FranchiseForm from './FranchiseForm';

import fetch from '../../../utils/fetch';

export default class AddFranchise extends Component {
  addFranchise(newFranchise) {
    return fetch('/api/franchises', 'post', true, newFranchise);
  }

  render() {
    return (
      <FranchiseForm
        title='Add Franchise'
        submitButtonText='Create Franchise'
        updateFranchise={ this.addFranchise.bind(this) } />
    );
  }
}
