import React, { Component } from 'react';
import { Button, Icon, Input, Menu, Sidebar } from 'semantic-ui-react';

export default class FilterMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: props.defaultFilters,
      isSidebarVisible: false,
      sort: props.defaultSort,
      titleFilter: ''
    }

    this.clearAll = this.clearAll.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  clearAll() {
    const defaultFilters = this.props.defaultFilters;
    const defaultSort = this.props.defaultSort;
    this.setState({
      filters: defaultFilters,
      sort: defaultSort,
      titleFilter: ''
    });
    this.props.handleFilterChange(defaultFilters);
    this.props.handleSortChange(defaultSort);
  }

  handleTitleChange(event) {
    this.setState({ titleFilter: event.target.value });
  }

  onTitleFilterChange(event) {
    if (event.key === 'Enter') this.handleFilterChange(event.target.name, event.target.value);
  }

  handleFilterChange(filter, value) {
    const filters = {
      ...this.state.filters,
      [filter]: value
    };

    this.setState({ filters });
    this.props.handleFilterChange(filters);
  }

  handleSortChange(name, value) {
    const newSort = { field: name, order: value };
    this.setState({ sort: newSort });
    this.props.handleSortChange(newSort);
  }

  toggleSidebar() {
    this.setState({ isSidebarVisible: !this.state.isSidebarVisible });
  }

  hideSidebar() {
    this.setState({ isSidebarVisible: false });
  }

  render() {
    const filterControls = this.props.getFilterControlsFunction ? this.props.getFilterControlsFunction(
      this.state.filters,
      this.handleFilterChange
    ) : {};
    const hasFilterControls = Object.keys(filterControls).length > 0;
    const sortControls = this.props.getSortControlsFunction ? this.props.getSortControlsFunction(
      this.state.sort,
      this.state.filters,
      this.handleSortChange
    ) : {};
    const hasSortControls = Object.keys(sortControls).length > 0;

    return (
      <div>
        <Button onClick={this.toggleSidebar}><Icon name='bars' />Filter/Sort</Button>
        <Input
          name='title'
          icon='search'
          placeholder='Search...'
          value={ this.state.titleFilter }
          onChange={ this.handleTitleChange.bind(this) }
          onKeyPress={ this.onTitleFilterChange.bind(this) } />
        <br/><br/><br/>
        {
          (hasFilterControls || hasSortControls) &&
          <Sidebar as={Menu}
            animation='overlay'
            onHide={this.hideSidebar.bind(this)}
            vertical
            visible={this.state.isSidebarVisible}
            width='wide'
          >
            <Menu.Item header></Menu.Item>
            <Menu.Item><Button primary onClick={() => this.clearAll()}>Clear All</Button></Menu.Item>
            {
              hasFilterControls &&
              <div>
                <Menu.Item header>Filter By</Menu.Item>
                { filterControls }
              </div>
            }
            {
              hasSortControls &&
              <div>
                <Menu.Item header>Sort By</Menu.Item>
                { sortControls }
              </div>
            }
          </Sidebar>
        }
      </div>
    );
  }
}