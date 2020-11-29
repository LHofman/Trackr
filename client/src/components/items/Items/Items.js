import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Item from './Item';
import ItemDetails from '../ItemDetails/ItemDetails';
import ListWithDetails from '../../../hoc/ListWithDetails';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';

import fetch from '../../../utils/fetch';
import { getItemsFiltersControlsExtraParams, getItemsFiltersControls, getItemsFiltersDefaults, filterItem, applyCustomFilter } from '../../../utils/items/itemsFilters';
import { itemsSortDefault, sortItems, getItemsSortControls } from '../../../utils/items/itemsSorting';

import { SET_ITEMS_LIST_FILTERS, SET_ITEMS_LIST_PAGE, SET_ITEMS_LIST_SORTING } from '../../../store/items/actions';
import { LIST_FILTERS, LIST_PAGE, LIST_SORTING } from '../../../store/items/keys';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      filtersDefault: getItemsFiltersDefaults(),
      sortDefault: itemsSortDefault,
      filterControlsExtraFields: {},
      detailsComponent: null,
      redirect: undefined
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
  }

  componentWillMount() {
    Promise.all([
      this.getItems(),

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

    const filtersDefault = getItemsFiltersDefaults();
    const sortDefault = itemsSortDefault;

    const filter = props.match.params.filter;
    applyCustomFilter(filtersDefault, sortDefault, filter);

    this.setState({ filtersDefault, sortDefault});
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
            defaults: this.state.filtersDefault,
            getControls: getItemsFiltersControls(this.state.filterControlsExtraFields),
            filterItem: filterItem,
            action: SET_ITEMS_LIST_FILTERS,
            listKey: LIST_FILTERS
          }}
          sortConfig={{
            defaults: this.state.sortDefault,
            getControls: getItemsSortControls(),
            sortItems: sortItems,
            action: SET_ITEMS_LIST_SORTING,
            listKey: LIST_SORTING
          }}
          paginationConfig={{
            action: SET_ITEMS_LIST_PAGE,
            listKey: LIST_PAGE
          }}
          reducer='items' />
      </ListWithDetails>
    );
  }
}
