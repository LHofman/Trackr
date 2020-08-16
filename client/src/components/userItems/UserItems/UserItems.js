import React, { Component } from 'react';

import PaginatedList from '../../UI/PaginatedList/PaginatedList';
import UserItem from './UserItem';

import fetch from '../../../utils/fetch';
import filterUserItem from './filterUserItem';
import getItemsFilterControlsExtraParams from '../../items/Items/getItemsFilterControlsExtraParams';
import getUser from '../../../utils/getUser';
import getUserItemsFilterControls from './getUserItemsFilterControls';
import getUserItemsSortControls from './getUserItemsSortControls';
import getUserItemsFilterDefaults from './getUserItemsFilterDefaults';
import itemsSortDefault from '../../items/Items/itemsSortDefault';
import sortUserItems from './sortUserItems';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      userItems: [],
      filterControlsExtraFields: {}
    }
  }

  componentWillMount() {
    this.getUser();

    getItemsFilterControlsExtraParams().then(filterControlsExtraFields => {
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

  render() {
    return (
      <PaginatedList
        title='My Items'
        createItemUrl={`/items/add`}
        items={this.state.userItems}
        createItemComponent={(userItem) => <UserItem key={userItem._id} userItem={userItem}></UserItem>}
        filtersConfig={{
          defaults: getUserItemsFilterDefaults(),
          getControls: getUserItemsFilterControls,
          getControlsExtraParams: this.state.filterControlsExtraFields,
          filterItem: filterUserItem
        }}
        sortConfig={{
          defaults: itemsSortDefault,
          getControls: getUserItemsSortControls,
          sortItems: sortUserItems
        }} />
    );
  }
}
