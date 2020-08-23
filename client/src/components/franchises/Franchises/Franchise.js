import React, { Component } from 'react';
import { Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../../utils/canEdit';

export default class Franchise extends Component {

  constructor(props) {
    super(props);
    this.state = {
      confirmationAlert: false
    }

    this.onDelete = this.onDelete.bind(this);
    this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
  }

  hideConfirmationAlert() {
    this.setState({ confirmationAlert: false });
  }

  onDelete(franchise) {
    this.hideConfirmationAlert();
    this.props.onDelete(franchise);
  }

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

  onHeaderClick() {
    this.props.onClickCallback(this.props.franchise);
  }
  
  render() {
    const { franchise, parent, onDelete } = this.props;
    
    let onClickAttributes = { href: `/franchises/${franchise.title_id}` };
    if (this.props.onClickCallback) {
      onClickAttributes = { onClick: this.onHeaderClick.bind(this) };
    }

    return (
      <List.Item>
        <List.Content>
          <List.Header>
            <a { ...onClickAttributes }>{franchise.title}</a>
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
                  onConfirm={() => this.onDelete(franchise)}
                />
              ]
            }
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
