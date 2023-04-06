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

import { SET_FRANCHISES_LIST_FILTERS, SET_FRANCHISES_LIST_PAGE, SET_FRANCHISES_LIST_SORTING } from '../../../store/franchises/actions';
import { LIST_FILTERS, LIST_PAGE, LIST_SORTING } from '../../../store/franchises/keys';

export default class Franchises extends Component {
  constructor() {
    super();
    this.state = {
      franchises: [],
      redirect: undefined
    }
  }

  componentWillMount() {
    this.getFranchises();
  }

  deleteFranchise(franchise) {
    const franchises = this.state.franchises.filter((stateFranchise) =>
      stateFranchise._id !== franchise._id
    );
    this.setState({franchises});
  }

  getFranchises() {
    return fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) throw new Error('No franchises found');
      franchises.sort(this.sort);
      this.setState({ franchises })
    }).catch(console.log);
  }

  render() {
    const { franchises, redirect } = this.state;
		if (redirect) return <Redirect to={redirect} />

    return (
      <ListWithDetails
        isLoaded={franchises.length > 0}
        detailsRoutePath='/franchises/:titleId'
        location={this.props.location}
        renderDetailsComponent={(props) => (
          <FranchiseDetails 
            {...props}
            match='/franchises'
            franchise={ franchises.filter((franchise) =>
              franchise.title_id === props.match.params.titleId
            )[0] }
            deleteFranchise={ this.deleteFranchise.bind(this) }/>
        )} >
        <PaginatedList
          title='Franchises'
          createItemUrl={`/franchises/add`}
          items={franchises}
          extraAttributes= {{ bulleted: true }}
          createItemComponent={(franchise) => (
            <Franchise key={franchise._id} franchise={franchise} match='/franchises' />
          )}
          filtersConfig={{
            defaults: getFranchisesFiltersDefaults(),
            filterItem: filterFranchise,
            action: SET_FRANCHISES_LIST_FILTERS,
            listKey: LIST_FILTERS
          }}
          sortConfig={{
            defaults: franchisesSortDefault,
            getControls: getFranchisesSortControls,
            sortItems: sort,
            action: SET_FRANCHISES_LIST_SORTING,
            listKey: LIST_SORTING
          }}
          paginationConfig={{
            action: SET_FRANCHISES_LIST_PAGE,
            listKey: LIST_PAGE
          }}
          list = {{
            extraAttributes: {
              bulleted: true
            }
          }}
          reducer='franchises' />
      </ListWithDetails>
    );
  }
}
