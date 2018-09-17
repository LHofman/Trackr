import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Input, List } from 'semantic-ui-react';

import Item from './Item';

import fetch from '../../utils/fetch';
import isLoggedIn from '../../utils/isLoggedIn';
import typeOptions from './typeOptions';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      typeFilter: '',
      titleFilter: ''
    }
  }

  componentWillMount() {
    this.getItems();
  }

  getItems() {
    return fetch('/api/items').then(items => {
      if (!items || items === null) throw new Error('No items found');
      items.sort((i1, i2) => i1.title < i2.title ? -1 : 1);
      this.setState({ items })
    }).catch(console.log);
  }

  onTitleFilterChange(event) {
    if (event.key === 'Enter') this.onFilterChange(event);
  }

  onFilterChange(event) {
    this.handleValueChange(event.target.name, event.target.value);
  }

  handleValueChange(name, value) {
    this.setState({ [name]: value });
  }

  render() {
    const {typeFilter, titleFilter} = this.state;
    const filteredItems = this.state.items.filter(item => 
      item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      (typeFilter === '' || item.type === typeFilter)
    );
    
    const items = filteredItems.map(item => 
      <Item key={item._id} item={item}></Item>
    );

    return (
      <div>
        <h2>Items</h2>
        <Input name='titleFilter' onKeyPress={this.onTitleFilterChange.bind(this)} icon='search' placeholder='Search...' />&nbsp;&nbsp;&nbsp;
        <Dropdown placeholder='Type' name='typeFilter' selection value={''}
          options={[{ text: '---No Filter---', value: '' }, ...typeOptions]}
          onChange={(param, data) => this.handleValueChange('typeFilter', data.value)} />&nbsp;&nbsp;&nbsp;
        {
          isLoggedIn() && 
          <Button positive circular floated='right' icon='plus' as={Link} to='/items/add' />
        }
        <List>
          {items}
        </List>
      </div>
    );
  }
}
