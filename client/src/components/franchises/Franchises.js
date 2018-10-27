import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Input, Label, List, Pagination } from 'semantic-ui-react';

import Franchise from './Franchise';

import fetch from '../../utils/fetch';
import isLoggedIn from '../../utils/isLoggedIn';

export default class Franchises extends Component {
  constructor() {
    super();
    this.state = {
      franchises: [],
      titleFilter: '',
      sortOrder: 'asc',
      activePage: 1,
    }

    this.onTitleFilterChange = this.onTitleFilterChange.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.sort = this.sort.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  componentWillMount() {
    this.getFranchises();
  }

  getFranchises() {
    return fetch('/api/franchises').then(franchises => {
      if (!franchises || franchises === null) throw new Error('No franchises found');
      franchises.sort(this.sort);
      this.setState({ franchises })
    }).catch(console.log);
  }

  onTitleFilterChange(event) {
    if (event.key === 'Enter') {
      this.handleValueChange(event.target.name, event.target.value);
      this.setState({ activePage: 1 });
    }
  }

  handleValueChange(name, value) {
    this.setState({ [name]: value });
  }

  toggleSort() {
    const currentSortOrder = this.state.sortOrder;
    this.handleValueChange('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc');
  }

  sort(i1, i2) {
    const asc = this.state.sortOrder === 'asc' ? -1 : 1;
    return i1.title.toString().toLowerCase() < i2.title.toString().toLowerCase() ? asc : asc * -1;
  }

  handlePaginationChange(e, { activePage }) {
    this.setState({ activePage });
    animateScroll.scrollToTop();
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
          <Pagination activePage={this.state.activePage} totalPages={totalPages} onPageChange={this.handlePaginationChange.bind(this)} />
        </MediaQuery>
      </div>
    )
  }

  render() {
    const { titleFilter, sortOrder} = this.state;
    
    let filteredFranchises = this.state.franchises.filter(franchise => 
      franchise.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1
    ).sort(this.sort);
    
    const begin = (this.state.activePage - 1) * 100;
    const totalPages = Math.ceil(filteredFranchises.length / 100, 0);
    const franchises = filteredFranchises
      .slice(begin, begin + 100)
      .map(franchise => 
        <Franchise key={franchise._id} franchise={franchise}></Franchise>
      );

    return (
      <div>
        <h2>Franchises</h2>
        {
          isLoggedIn() && 
          <Button positive circular floated='right' icon='plus' as={Link} to='/franchises/add' />
        }
        <Input name='titleFilter' onKeyPress={this.onTitleFilterChange.bind(this)} icon='search' placeholder='Search...' />&nbsp;&nbsp;&nbsp;
        <Button name='sort' onClick={this.toggleSort}>{'Sort by title ' + (sortOrder === 'asc' ? 'desc' : 'asc')}</Button><br/><br/>
        {this.getPagination(totalPages)}
        <List bulleted>
          {franchises}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}
