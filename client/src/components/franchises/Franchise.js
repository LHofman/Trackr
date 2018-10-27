import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

export default class Franchise extends Component {
  render() {
    const franchise = this.props.franchise;
    return (
      <List.Item>
        <List.Content>
          <List.Header>{franchise.title}</List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
