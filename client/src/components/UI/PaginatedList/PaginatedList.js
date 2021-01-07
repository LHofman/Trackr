import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Grid, GridColumn, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';

import isLoggedIn from '../../../utils/isLoggedIn';

class PaginatedList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changingOrder: false,
      parentTitle: props.parentTitle
    }
    
    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }
  
  componentWillReceiveProps(newProps) {
    const existingParentTitle = this.state.parentTitle;

    this.setState({ 
      items: newProps.items || [],
      parentTitle: newProps.parentTitle
    });

    if (newProps.parentTitle !== existingParentTitle) {
      newProps.handleFilterChange(newProps.filtersConfig.defaults);
      newProps.handleSortChange(newProps.sortConfig.defaults);
    }
  }

  changePage(activePage) {
    this.props.handlePageChange(activePage);
  }

  getPagination(totalPages) {
    return (
      <div>
        <MediaQuery query='(max-width: 550px)'>
          <Button icon='fast backward' onClick={() => this.changePage(1)} />
          <Button icon='step backward' onClick={() => this.changePage(this.props.activePage-1)} />
          <Label content={`${this.props.activePage}/${totalPages}`} color='teal' />
          <Button icon='step forward' onClick={() => this.changePage(this.props.activePage+1)} />
          <Button icon='fast forward' onClick={() => this.changePage(totalPages)} />
        </MediaQuery>
        <MediaQuery query='(min-width: 550px)'>
          <Pagination
            activePage={this.props.activePage}
            totalPages={totalPages}
            onPageChange={this.handlePaginationChange.bind(this)} />
        </MediaQuery>
      </div>
    )
  }

  handlePaginationChange(e, { activePage }) {
    this.props.handlePageChange(activePage);
    animateScroll.scrollToTop();
  }

  handleFilterChange(filters) {
    this.props.handleFilterChange(filters);
  }

  handleSortChange(newSort) {
    this.props.handleSortChange(newSort);
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
        activePage,
        createItemComponent,
        createItemUrl,
        filters,
        filtersConfig,
        items,
        sort,
        sortConfig,
        startChangeOrder,
        title
      },
      state: {
        changingOrder
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
                filters={filters}
                defaultFilters={filters}
                sort={sort}
                defaultSort={sortConfig.defaults}
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

const mapStateToProps = (state, ownProps) => {
  return {
    activePage: state[ownProps.reducer][ownProps.paginationConfig.listKey],
    filters: state[ownProps.reducer][ownProps.filtersConfig.listKey],
    sort: state[ownProps.reducer][ownProps.sortConfig.listKey]
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handlePageChange: (page) => dispatch({ type: ownProps.paginationConfig.action, payload: page }),
    handleFilterChange: (filters) => dispatch({ type: ownProps.filtersConfig.action, payload: filters }),
    handleSortChange: (newSort) => dispatch({ type: ownProps.sortConfig.action, payload: newSort })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PaginatedList);
