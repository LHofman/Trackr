import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Grid, GridColumn, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';

import isLoggedIn from '../../../utils/isLoggedIn';

export default class PaginatedList extends Component {
  constructor(props) {
    super(props);

    const filtersConfig = props.filtersConfig || {};
    const sortConfig = props.sortConfig || {};

    this.state = {
      activePage: 1,
      changingOrder: false,
      filters: filtersConfig.defaults,
      sort: sortConfig.defaults,
    }
    
    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }
  
  componentWillReceiveProps(newProps) {
    this.setState({ 
      items: newProps.items || [],
      activePage: 1,
      filters: newProps.filtersConfig.defaults,
      sort: newProps.sortConfig.defaults
    });
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

	startChangeOrder() {
    this.setState({ changingOrder: true });
    this.props.startChangeOrder();
	}

	saveOrder() {
    this.setState({ changingOrder: false });
    this.props.saveOrder();
	}

  render() {
    const {
      props: {
        createItemComponent,
        createItemUrl,
        filtersConfig,
        items,
        sortConfig,
        startChangeOrder,
        title
      },
      state: {
        activePage,
        changingOrder,
        filters,
        sort
      }
    } = this;

    let filteredItems = [];
    if (items && items.length > 0) {
      filteredItems = items;
      if (filtersConfig) {
        filteredItems = filteredItems.filter(item => filtersConfig.filterItem(item, filters));
      }
      if (sortConfig) {
        filteredItems = filteredItems.sort(sortConfig.sortItems(sort, filters));
      }
    }
    
    const begin = (activePage - 1) * 100;
    const totalPages = Math.ceil(filteredItems.length / 100, 0);
    const itemComponents = filteredItems
      .slice(begin, begin + 100)
      .map(createItemComponent);

    return (
      <div>
        <h2>{title}</h2>
        {
          (createItemUrl && isLoggedIn()) && 
          <Button positive circular floated='right' icon='plus' as={Link} to={createItemUrl} />
        }
        <Grid style={{ maxWidth: '750px' }}>
          {
            (filtersConfig || sortConfig) &&
            <GridColumn width={8}>
              <FilterMenu
                defaultFilters={filters}
                defaultSort={sort}
                handleFilterChange={this.handleFilterChange}
                handleSortChange={this.handleSortChange}
                getFilterControlsFunction={filtersConfig.getControls}
                getSortControlsFunction={sortConfig.getControls} />
            </GridColumn>
          }
          {
            startChangeOrder &&
            <GridColumn width={8}>
              {
                changingOrder
                ? <Button positive onClick={ this.saveOrder.bind(this) }>Save order</Button>
                : <Button onClick={ this.startChangeOrder.bind(this) }>change order</Button>
              }
              <br/><br/>
            </GridColumn>
          }
        </Grid>
        {this.getPagination(totalPages)}
        <List { ...(this.props.list || {}).extraAttributes }>
          {itemComponents}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}