import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

export default class Franchise extends Component {
  render() {
    const franchise = this.props.franchise;
    return (
      <List.Item>
        <List.Content>
          <List.Header as='a' href={`/franchises/${franchise.title_id}`}>{franchise.title}</List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
