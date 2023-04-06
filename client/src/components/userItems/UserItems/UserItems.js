import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import ItemDetails from '../../items/ItemDetails/ItemDetails';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';
import ListWithDetails from '../../../hoc/ListWithDetails';
import UserItem from './UserItem';

import fetch from '../../../utils/fetch';
import getUser from '../../../utils/getUser';
import { getItemsFiltersControlsExtraParams } from '../../../utils/items/itemsFilters';
import { itemsSortDefault } from '../../../utils/items/itemsSorting';
import { getUserItemsSortControls, sortUserItems } from '../../../utils/userItems/userItemsSorting';
import {
  applyCustomFilter,
  getUserItemsFilterControls,
  getUserItemsFilterDefaults,
  filterUserItem
} from '../../../utils/userItems/userItemsFilters';

import { SET_USERITEMS_LIST_FILTERS, SET_USERITEMS_LIST_PAGE, SET_USERITEMS_LIST_SORTING } from '../../../store/userItems/actions';
import { LIST_FILTERS, LIST_PAGE, LIST_SORTING } from '../../../store/userItems/keys';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      userItems: [],
      filtersDefault: getUserItemsFilterDefaults(),
      sortDefault: itemsSortDefault,
      filterControlsExtraFields: {},
      redirect: null
    }
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
    this.setState({ redirect: '' }, () => { this.checkCustomFilter(props) });
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

  deleteItem(item) {
    const userItems = this.state.userItems.filter((stateUserItem) =>
      stateUserItem.item_id !== item._id
    );
    this.setState({ userItems, redirect: '/userItems' });
  }

  getUser() {
    return fetch(`/api/userItems/${getUser().id}`).then(userItems => {
      if (!userItems || userItems === null) throw new Error('No userItems found');
      userItems.sort(sortUserItems(itemsSortDefault));
      this.setState({ userItems })
    }).catch(console.log);
  }

  render() {
    const { redirect, userItems } = this.state;
		if (redirect) return <Redirect to={redirect} />

    return (
      <ListWithDetails
        isLoaded={userItems.length > 0}
        detailsRoutePath='/myItems/:titleId'
        location={this.props.location}
        renderDetailsComponent={(props) => (
          <ItemDetails 
            {...props}
            match='/myItems'
            item={ userItems.filter((ui) =>
              ui.item.title_id === props.match.params.titleId
            )[0].item }
            deleteItem={ this.deleteItem.bind(this) } />
        )} >
        <PaginatedList
          title='My Items'
          createItemUrl={`/items/add`}
          items={this.state.userItems}
          createItemComponent={(userItem) => (
            <UserItem
              key={userItem._id}
              userItem={userItem}
              match='/myItems' />
          )}
          filtersConfig={{
            defaults: this.state.filtersDefault,
            getControls: getUserItemsFilterControls(this.state.filterControlsExtraFields),
            filterItem: filterUserItem,
            action: SET_USERITEMS_LIST_FILTERS,
            listKey: LIST_FILTERS
          }}
          sortConfig={{
            defaults: this.state.sortDefault,
            getControls: getUserItemsSortControls(),
            sortItems: sortUserItems,
            action: SET_USERITEMS_LIST_SORTING,
            listKey: LIST_SORTING
          }}
          paginationConfig={{
            action: SET_USERITEMS_LIST_PAGE,
            listKey: LIST_PAGE
          }}
          reducer='userItems' />
      </ListWithDetails>
    );
  }
}
