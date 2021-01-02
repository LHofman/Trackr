import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';

export default class ItemsList extends Component {
  render() {
    const { list } = this.props;
    
    return (
      <List.Item>
        <List.Content>
          <List.Header>
            <Link to={`${this.props.match}/${list.title_id}`}>{list.title}</Link>
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
