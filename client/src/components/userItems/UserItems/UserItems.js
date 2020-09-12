import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import ItemDetails from '../../items/ItemDetails/ItemDetails';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';
import ListWithDetails from '../../../hoc/ListWithDetails';
import UserItem from './UserItem';

import fetch from '../../../utils/fetch';
import getUser from '../../../utils/getUser';
import { getItemsFiltersControlsExtraParams } from '../../items/Items/itemsFilters';
import { itemsSortDefault, getItemsSortControls } from '../../items/Items/itemsSorting';
import { sortUserItems } from './userItemsSorting';
import { getUserItemsFilterControls, getUserItemsFilterDefaults, filterUserItem } from './userItemsFilters';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      userItems: [],
      filterControlsExtraFields: {},
      detailsComponent: null,
      redirect: null
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
  }

  componentWillMount() {
    this.getUser();

    getItemsFiltersControlsExtraParams().then(filterControlsExtraFields => {
      this.setState({ filterControlsExtraFields });
    });
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

    console.log(window.innerWidth);
    console.log(userItem);

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
            defaults: getUserItemsFilterDefaults(),
            getControls: getUserItemsFilterControls(this.state.filterControlsExtraFields),
            filterItem: filterUserItem
          }}
          sortConfig={{
            defaults: itemsSortDefault,
            getControls: getItemsSortControls(),
            sortItems: sortUserItems
          }} />
      </ListWithDetails>
    );
  }
}
