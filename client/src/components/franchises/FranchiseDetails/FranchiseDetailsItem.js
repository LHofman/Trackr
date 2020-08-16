import React, { Component } from 'react';
import { Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../../utils/canEdit';
import getIcon from '../../../utils/getIcon';

export default class FranchiseDetailsItem extends Component {
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
        {getIcon(item)}
        <List.Content>
          <List.Header>
            <a href={`/items/${item.title_id}`}>{item.title}</a>
            {
              canEdit(franchise) &&
              <Icon name='trash' color='red' onClick={this.showConfirmationAlert.bind(this)} />
            }
          </List.Header>
          <List.Description>
            Release Date: {
              item.releaseDateStatus === 'Date' ? 
              new Date(item.releaseDate).toDateString() :
              item.releaseDateStatus
            }<br />
            {
              item.type === 'Movie' && item.releaseDateDvd ?
              `Dvd Release Date: ${
                item.releaseDateDvdStatus === 'Date' ? 
                new Date(item.releaseDateDvd).toDateString() :
                item.releaseDateStatusDvd
              }` : ''
            }
          </List.Description>
          <Confirm
            open={this.state.confirmationAlert}
            header={`confirm removal`}
            content={`Are you sure you want to remove ${item.title} from ${franchise.title}?`}
            onCancel={this.hideConfirmationAlert.bind(this)}
            onConfirm={() => this.props.onDelete(item)}
          />
        </List.Content>
      </List.Item>
    );
  }
}
