import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';

import isLoggedIn from '../../../utils/isLoggedIn';

export default class PaginatedList extends Component {
  constructor(props) {
    super(props);
    
    const filtersConfig = props.filtersConfig || {};
    const sortConfig = props.sortConfig || {};

    this.state = {
      activePage: 1,
      addItems: [],
      filters: filtersConfig.defaults,
      sort: sortConfig.defaults
    }
    
    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }
  
  changePage(activePage) {
    this.handlePaginationChange(null, { activePage });
  }

  getPagination(totalPages) {
    return (
      <div>
        <MediaQuery query='(max-width: 550px)'>
          <Button icon='fast backward' onClick={() => this.changePage(1)} />
          <Button icon='step backward' onClick={() => this.changePage(this.state.activePage-1)} />
          <Label content={`${this.state.activePage}/${totalPages}`} color='teal' />
          <Button icon='step forward' onClick={() => this.changePage(this.state.activePage+1)} />
          <Button icon='fast forward' onClick={() => this.changePage(totalPages)} />
        </MediaQuery>
        <MediaQuery query='(min-width: 550px)'>
          <Pagination
            activePage={this.state.activePage}
            totalPages={totalPages}
            onPageChange={this.handlePaginationChange.bind(this)} />
        </MediaQuery>
      </div>
    )
  }

	handleAddItemsChange(e, { value }) {
		this.setState({ addItems: value })
	}

  handlePaginationChange(e, { activePage }) {
    this.setState({ activePage });
    animateScroll.scrollToTop();
  }

  handleFilterChange(filters) {
    this.setState({ filters });
    this.setState({ activePage: 1 });
  }

  handleSortChange(newSort) {
    this.setState({ sort: newSort });
  }

  render() {
    const filtersConfig = this.props.filtersConfig;
    const sortConfig = this.props.sortConfig;

    let filteredItems = [];
    if (this.props.items && this.props.items.length > 0) {
      filteredItems = this.props.items;
      if (filtersConfig) {
        filteredItems = filteredItems.filter(item => this.props.filtersConfig.filterItem(item, this.state.filters));
      }
      if (sortConfig) {
        filteredItems = filteredItems.sort(this.props.sortConfig.sortItems(this.state.sort, this.state.filters));
      }
    }
    
    const begin = (this.state.activePage - 1) * 100;
    const totalPages = Math.ceil(filteredItems.length / 100, 0);
    const items = filteredItems
      .slice(begin, begin + 100)
      .map(this.props.createItemComponent);

    return (
      <div>
        <h2>{ this.props.title }</h2>
        {
          (this.props.createItemUrl && isLoggedIn()) && 
          <Button positive circular floated='right' icon='plus' as={Link} to={this.props.createItemUrl} />
        }
        {
          (filtersConfig || sortConfig) &&
          <FilterMenu
            defaultFilters={ filtersConfig.defaults }
            defaultSort={ sortConfig.defaults }
            handleFilterChange={this.handleFilterChange}
            handleSortChange={this.handleSortChange}
            getFilterControlsFunction={ filtersConfig.getControls }
            getSortControlsFunction={ sortConfig.getControls } />
        }
        {this.getPagination(totalPages)}
        <List { ...this.props.extraAttributes }>
          {items}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}