import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Dropdown, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';

import isLoggedIn from '../../../utils/isLoggedIn';

export default class PaginatedList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      addItems: [],
      filters: props.filtersConfig.defaults,
      sort: props.sortConfig.defaults
    }
    
    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }
  
	addItems() {
    this.props.addItemToList.addItems(this.state.addItems);
    this.setState({ addItems: [] });
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
    let filteredItems = [];
    if (this.props.items) {
      filteredItems = this.props.items
        .filter(item => this.props.filtersConfig.filterItem(item, this.state.filters))
        .sort(this.props.sortConfig.sortItems(this.state.sort));
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
        <FilterMenu
          defaultFilters={this.props.filtersConfig.defaults}
          defaultSort={this.props.sortConfig.defaults}
          handleFilterChange={this.handleFilterChange}
          handleSortChange={this.handleSortChange}
          getFilterControlsFunction={this.props.filtersConfig.getControls}
          getFilterControlsFunctionExtraParams={this.props.filtersConfig.getControlsExtraParams}
          getSortControlsFunction={this.props.sortConfig.getControls} />
        {
          this.props.addItemToList &&
          <div>
            <Dropdown
              placeholder='Add items'
              clearable={1} multiple search selection
              loading={this.props.addItemToList.isLoading}
              minCharacters={this.props.addItemToList.minCharacters || 2}
              options={this.props.addItemToList.options}
              onChange={this.handleAddItemsChange.bind(this)}
              value={this.state.addItems}/>&nbsp;&nbsp;&nbsp;
            <Button onClick={this.addItems.bind(this)}>Add</Button><br/><br/>
          </div>
        }
        {this.getPagination(totalPages)}
        <List>
          {items}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}