import { Component } from 'react';
import { Link } from 'react-router-dom';
import { List } from 'semantic-ui-react';

import getIcon from '../../../utils/getIcon';
import { isDateStatusValid } from '../../../utils/dateUtils';

import * as ItemTypes from '../../../types/item/item';

type MyProps = {
  match: string;
  item: ItemTypes.Item;
};

type MyState = {
  item: ItemTypes.Item;
};

export default class Item extends Component<MyProps, MyState> {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item
    }
  }

  render() {
    const item = this.state.item;

    return (
      <List.Item>
        {getIcon(item)}
        <List.Content>
          <List.Header>
            <Link to={`${this.props.match}/${item.title_id}`}>{item.title}</Link>
          </List.Header>
          <List.Description>
            Release Date: {
              item.releaseDateStatus === 'Date' ? 
              new Date(item.releaseDate).toDateString() :
              item.releaseDateStatus
            }<br />
            {
              (
                item.releaseDateDvd &&
                item.releaseDateDvdStatus &&
                isDateStatusValid(item.releaseDateDvdStatus)
              ) ? `Dvd Release Date: ${
                item.releaseDateDvdStatus === 'Date' ? 
                new Date(item.releaseDateDvd).toDateString() :
                item.releaseDateDvdStatus
              }` : ''
            }
          </List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
