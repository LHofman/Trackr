import React, { Component } from 'react';
import { Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';

export default class Franchise extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
    const { franchise, parent, onDelete } = this.props;
    return (
      <List.Item>
        <List.Content>
          <List.Header>
            <a href={`/franchises/${franchise.title_id}`}>{franchise.title}</a>
            {
              parent && onDelete && canEdit(parent) &&
              [ 
                <Icon key='icon' name='trash' color='red' onClick={this.showConfirmationAlert.bind(this)} />,
                <Confirm
                  key='confirm'
                  open={this.state.confirmationAlert}
                  header={`confirm removal`}
                  content={`Are you sure you want to remove ${franchise.title} from ${parent.title}?`}
                  onCancel={this.hideConfirmationAlert.bind(this)}
                  onConfirm={() => this.props.onDelete(franchise)}
                />
              ]
            }
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
