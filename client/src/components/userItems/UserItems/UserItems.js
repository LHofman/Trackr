import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import ItemDetails from '../../items/ItemDetails/ItemDetails';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';
import ListWithDetails from '../../../hoc/ListWithDetails';
import UserItem from './UserItem';

import fetch from '../../../utils/fetch';
import getUser from '../../../utils/getUser';
import { getItemsFiltersControlsExtraParams } from '../../../utils/items/itemsFilters';
import { itemsSortDefault, getItemsSortControls } from '../../../utils/items/itemsSorting';
import { sortUserItems } from '../../../utils/userItems/userItemsSorting';
import {
  applyCustomFilter,
  getUserItemsFilterControls,
  getUserItemsFilterDefaults,
  filterUserItem
} from '../../../utils/userItems/userItemsFilters';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      userItems: [],
      filtersDefault: getUserItemsFilterDefaults(),
      sortDefault: itemsSortDefault,
      filterControlsExtraFields: {},
      detailsComponent: null,
      redirect: null
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
  }

  componentWillMount() {
    Promise.all([
      this.getUser(),

      new Promise((resolve) => {
        getItemsFiltersControlsExtraParams().then(filterControlsExtraFields => {
          this.setState({ filterControlsExtraFields });
          setTimeout(() => {
            resolve();
          });
        });
      })
    ]).then(() => {
      this.checkCustomFilter(this.props);
    });
  }

  componentWillReceiveProps(props) {
    this.checkCustomFilter(props);
  }

  checkCustomFilter(props) {
    if (!props.match || !props.match) {
      return;
    }

    const filtersDefault = getUserItemsFilterDefaults();
    const sortDefault = itemsSortDefault;

    const filter = props.match.params.filter;
    applyCustomFilter(filtersDefault, sortDefault, filter);

    this.setState({ filtersDefault, sortDefault});
  }

  getUser() {
    return fetch(`/api/userItems/${getUser().id}`).then(userItems => {
      if (!userItems || userItems === null) throw new Error('No userItems found');
      userItems.sort(sortUserItems(itemsSortDefault));
      this.setState({ userItems })
    }).catch(console.log);
  }

  setDetailsComponent(userItem) {
    if (!userItem) {
      this.setState({ detailsComponent: null });
      return;
    }

    if (window.innerWidth < 1200) {
      this.setState({ redirect: `/items/${userItem.item.title_id}`});
      return;
    }

    this.setState({
      detailsComponent: <ItemDetails item={ userItem.item } onBackCallback={ this.setDetailsComponent } />
    });
  }

  render() {
    const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />

    return (
      <ListWithDetails detailsComponent={ this.state.detailsComponent }>
        <PaginatedList
          title='My Items'
          createItemUrl={`/items/add`}
          items={this.state.userItems}
          createItemComponent={(userItem) => (
            <UserItem
              key={userItem._id}
              userItem={userItem}
              onClickCallback={ this.setDetailsComponent } ></UserItem>
          )}
          filtersConfig={{
            defaults: this.state.filtersDefault,
            getControls: getUserItemsFilterControls(this.state.filterControlsExtraFields),
            filterItem: filterUserItem
          }}
          sortConfig={{
            defaults: this.state.sortDefault,
            getControls: getItemsSortControls(),
            sortItems: sortUserItems
          }} />
      </ListWithDetails>
    );
  }
}
