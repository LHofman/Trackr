import React, { Component } from 'react';

import Item from './Item';
import ItemDetails from '../ItemDetails';
import ListWithDetails from '../../../hoc/ListWithDetails';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';

import fetch from '../../../utils/fetch';
import { getItemsFiltersControlsExtraParams, getItemsFiltersControls, getItemsFiltersDefaults, filterItem } from './itemsFilters';
import { itemsSortDefault, sortItems, getItemsSortControls } from './itemsSorting';
import { Redirect } from 'react-router-dom';
import { sort } from '../../../utils/sortUtils';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      filterControlsExtraFields: {},
      detailsComponent: null,
      redirect: undefined
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
  }

  componentWillMount() {
    this.getItems();

    getItemsFiltersControlsExtraParams().then(filterControlsExtraFields => {
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

  setDetailsComponent(item) {
    if (!item) {
      this.setState({ detailsComponent: null });
      return;
    }

    if (window.innerWidth < 1200) {
      this.setState({ redirect: `/items/${item.title_id}`});
      return;
    }

    this.setState({ detailsComponent: <ItemDetails item={ item } onBackCallback={ this.setDetailsComponent } /> });
  }

  render() {
    const redirect = this.state.redirect;
		if (redirect) return <Redirect to={redirect} />

    return (
      <ListWithDetails detailsComponent={ this.state.detailsComponent }>
        <PaginatedList
          title='Items'
          createItemUrl={`/items/add`}
          items={this.state.items}
          createItemComponent={(item) => (
            <Item key={item._id} item={item} onClickCallback={ this.setDetailsComponent } ></Item>
          )}
          filtersConfig={{
            defaults: getItemsFiltersDefaults(),
            getControls: getItemsFiltersControls(this.state.filterControlsExtraFields),
            filterItem: filterItem
          }}
          sortConfig={{
            defaults: itemsSortDefault,
            getControls: getItemsSortControls,
            sortItems: sortItems
          }} />
      </ListWithDetails>
    );
  }
}
