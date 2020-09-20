import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Franchise from './Franchise';
import FranchiseDetails from '../FranchiseDetails/FranchiseDetails';

import fetch from '../../../utils/fetch';
import ListWithDetails from '../../../hoc/ListWithDetails';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';
import { filterFranchise, getFranchisesFiltersDefaults } from './franchisesFilters';
import { franchisesSortDefault, getFranchisesSortControls, } from './franchisesSorting';
import { sort } from '../../../utils/sortUtils';

export default class Franchises extends Component {
  constructor() {
    super();
    this.state = {
      franchises: [],
      detailsComponent: null,
      redirect: undefined
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
  }

  componentWillMount() {
    this.getFranchises();
  }

  getFranchises() {
    return fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) throw new Error('No franchises found');
      franchises.sort(this.sort);
      this.setState({ franchises })
    }).catch(console.log);
  }

  setDetailsComponent(franchise) {
    if (!franchise) {
      this.setState({ detailsComponent: null });
      return;
    }

    if (window.innerWidth < 1200) {
      this.setState({ redirect: `/franchises/${franchise.title_id}`});
      return;
    }

    this.setState({
      detailsComponent: <FranchiseDetails franchise={ franchise } onBackCallback={ this.setDetailsComponent } />
    });
  }

  render() {
    const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />

    return (
      <ListWithDetails detailsComponent={ this.state.detailsComponent }>
        <PaginatedList
          title='Franchises'
          createItemUrl={`/franchises/add`}
          items={this.state.franchises}
          extraAttributes= {{ bulleted: true }}
          createItemComponent={(franchise) => (
            <Franchise key={franchise._id} franchise={franchise} onClickCallback={ this.setDetailsComponent } />
          )}
          filtersConfig={{
            defaults: getFranchisesFiltersDefaults(),
            filterItem: filterFranchise
          }}
          sortConfig={{
            defaults: franchisesSortDefault,
            getControls: getFranchisesSortControls,
            sortItems: sort
          }}
          list = {{
            extraAttributes: {
              bulleted: true
            }
          }} />
      </ListWithDetails>
    );
  }
}
