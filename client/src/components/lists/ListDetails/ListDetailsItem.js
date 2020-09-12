import React, { Component } from 'react';
import { Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../../utils/canEdit';
import getIcon from '../../../utils/getIcon';

export default class ListDetailsItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: props.list,
      item: props.item,
      confirmationAlert: false,
      index: props.item.index
    }

    this.showConfirmationAlert = this.showConfirmationAlert.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ 
      index: newProps.item.index,
      item: newProps.item,
      list: newProps.list
    });
  }

  hideConfirmationAlert() {
    this.setState({ confirmationAlert: false });
  }

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

  changeIndex(e) {
    let value = parseInt(e.target.value, 10);
    this.updateIndex(value, false);
  }

  updateIndex(value, save = true) {
    if (value < 1) {
      value = 1;
    } else if (value > this.state.list.items.length) {
      value = this.state.list.items.length;
    }
    this.setState({ index: value });
    
    if (save) {
      setTimeout(() => {
        this.saveNewIndex();
      }, 0);
    }
  }

  saveNewIndex() {
    if (this.state.index === this.state.item.index) return;

    this.props.changeIndex(this.state.item.index, this.state.index);
  }

  render() {
    const {
      props: { changingOrder },
      state: {
        index,
        item,
        list
      }
    } = this;

    return (
      <List.Item>
        <List.Content>
          <List.Header>
            {
              changingOrder
              ? (
                <div style={{ display: 'inline' }}>
                  <Icon name='angle double up' onClick={() => this.updateIndex(1)} />
                  <Icon name='angle up' onClick={() => this.updateIndex(index - 1)} />
                  <Icon name='angle down' onClick={() => this.updateIndex(index + 1)} />
                  <Icon name='angle double down' onClick={() => this.updateIndex(list.items.length)} />
                  <input
                    name='index'
                    type='number'
                    min='1'
                    value={ index }
                    style={{ width: '50px' }}
                    onChange={(e) => this.changeIndex(e.target.value).bind(this)}
                    onBlur={ this.saveNewIndex.bind(this) } />
                </div>
              )
              : item.index
            }. &nbsp;
            {getIcon(item)}
            {
              changingOrder
              ? item.title
              : <a href={`/items/${item.title_id}`}>{item.title}</a>
            }
            {
              canEdit(list) &&
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
            content={`Are you sure you want to remove ${item.title} from ${list.title}?`}
            onCancel={this.hideConfirmationAlert.bind(this)}
            onConfirm={() => this.props.onDelete(item)}
          />
        </List.Content>
      </List.Item>
    );
  }
}
