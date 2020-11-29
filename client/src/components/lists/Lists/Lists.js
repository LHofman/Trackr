import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import ListDetails from '../ListDetails/ListDetails';
import ListWithDetails from '../../../hoc/ListWithDetails';
import ItemsList from './ItemsList';
import PaginatedList from '../../UI/PaginatedList/PaginatedList';

import fetch from '../../../utils/fetch';
import { filterList, getListsFiltersDefaults } from './listsFilters';
import { listsSortDefault, getListsSortControls } from './listsSorting';
import { sort } from '../../../utils/sortUtils';

import { SET_LISTS_LIST_FILTERS, SET_LISTS_LIST_PAGE, SET_LISTS_LIST_SORTING } from '../../../store/lists/actions';
import { LIST_FILTERS, LIST_PAGE, LIST_SORTING } from '../../../store/lists/keys';

export default class Lists extends Component {
  constructor() {
    super();
    this.state = {
      detailsComponent: null,
      lists: [],
      redirect: undefined
    }

    this.setDetailsComponent = this.setDetailsComponent.bind(this);
  }

  componentWillMount() {
    this.getLists();
  }

  getLists() {
    return fetch('/api/lists').then(lists => {
      if (!lists || lists === null) throw new Error('No lists found');
      lists.sort(this.sort);
      this.setState({ lists });
    }).catch(console.log);
  }

  deleteList(list) {
    const lists = this.state.lists.filter((stateList) => stateList._id !== list._id);
    this.setState({ lists, detailsComponent: null });
  }

  setDetailsComponent(list) {
    if (!list) {
      this.setState({ detailsComponent: null });
      return;
    }

    if (window.innerWidth < 1200) {
      this.setState({ redirect: `/lists/${list.title_id}`});
      return;
    }

    this.setState({
      detailsComponent: (
        <ListDetails
          list={ list }
          onBackCallback={ this.setDetailsComponent }
          deleteList={ this.deleteList.bind(this) } />
      )
    });
  }

  render() {
    const { detailsComponent, lists, redirect } = this.state;
		if (redirect) return <Redirect to={redirect} />

    return (
      <ListWithDetails listWidth={ 6 } detailsComponent={ detailsComponent }>
        <PaginatedList
          title='Lists'
          createItemUrl={`/lists/add`}
          items={lists}
          extraAttributes= {{ bulleted: true }}
          createItemComponent={(list) => <ItemsList key={list._id} list={list} onClickCallback={ this.setDetailsComponent } />}
          filtersConfig={{
            defaults: getListsFiltersDefaults(),
            filterItem: filterList,
            action: SET_LISTS_LIST_FILTERS,
            listKey: LIST_FILTERS
          }}
          sortConfig={{
            defaults: listsSortDefault,
            getControls: getListsSortControls,
            sortItems: sort,
            action: SET_LISTS_LIST_SORTING,
            listKey: LIST_SORTING
          }}
          paginationConfig={{
            action: SET_LISTS_LIST_PAGE,
            listKey: LIST_PAGE
          }}
          list = {{
            extraAttributes: {
              bulleted: true
            }
          }}
          reducer='lists' />
      </ListWithDetails>
    );
  }
}
