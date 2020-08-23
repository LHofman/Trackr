import React, { Component } from 'react';
import { Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../../utils/canEdit';

export default class ItemDetailsFranchise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      franchise: props.franchise,
      item: props.item,
      confirmationAlert: false
    }

    this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
  }

  hideConfirmationAlert() {
    this.setState({ confirmationAlert: false });
  }

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

  render() {
    const { franchise, item } = this.state;
    return (
      <List.Item>
        <List.Content>
          <List.Header>
            <a href={`/franchises/${franchise.title_id}`}>{franchise.title}</a>
            {
              canEdit(item) &&
              <Icon name='trash' color='red' onClick={this.showConfirmationAlert.bind(this)} />
            }
          </List.Header>
          <Confirm
            open={this.state.confirmationAlert}
            header={`confirm removal`}
            content={`Are you sure you want to remove ${item.title} from ${franchise.title}?`}
            onCancel={this.hideConfirmationAlert.bind(this)}
            onConfirm={() => this.props.onDelete(franchise)}
          />
        </List.Content>
      </List.Item>
    );
  }
}
