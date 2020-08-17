import React, { Component } from 'react';

import Item from './Item';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';

import fetch from '../../../utils/fetch';
import filterItem from './filterItem';
import getItemsFilterControls from './getItemsFilterControls';
import getItemsFilterDefaults from './getItemsFilterDefaults';
import getItemsSortControls from './getItemsSortControls';
import itemsSortDefault from './itemsSortDefault';
import sortItems from './sortItems';

import getItemsFilterControlsExtraParams from './getItemsFilterControlsExtraParams';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      filterControlsExtraFields: {}
    }
  }

  componentWillMount() {
    this.getItems();

    getItemsFilterControlsExtraParams().then(filterControlsExtraFields => {
      this.setState({ filterControlsExtraFields });
    });
  }

  getItems() {
    return fetch('/api/items').then(items => {
      if (!items || items === null) throw new Error('No items found');
      items.sort(sortItems(itemsSortDefault));
      this.setState({ items })
    }).catch(console.log);
  }

  render() {
    return (
      <PaginatedList
        title='Items'
        createItemUrl={`/items/add`}
        items={this.state.items}
        createItemComponent={(item) => <Item key={item._id} item={item}></Item>}
        filtersConfig={{
          defaults: getItemsFilterDefaults(),
          getControls: getItemsFilterControls(this.state.filterControlsExtraFields),
          filterItem: filterItem
        }}
        sortConfig={{
          defaults: itemsSortDefault,
          getControls: getItemsSortControls,
          sortItems: sortItems
        }} />
    );
  }
}
