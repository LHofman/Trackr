import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, List } from 'semantic-ui-react';

import Item from './Item';

import fetch from '../../utils/fetch';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      items: []
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

  render() {
    const items = this.state.items.map(item => 
      <Item key={item._id} item={item}></Item>
    );

    return (
      <div>
        <h2>Items</h2>
        <Button positive circular floated='right' icon='plus' as={Link} to='/items/add' />
        <List>
          {items}
        </List>
      </div>
    );
  }
}
