import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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

  render() {
    const { franchise, parent, onDelete } = this.props;
    
    return (
      <List.Item>
        <List.Content>
          <List.Header>
            <Link to={`${this.props.match}/${franchise.title_id}`}>{franchise.title}</Link>
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
