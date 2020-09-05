import moment from 'moment-timezone';
import React, { Component } from 'react';
import { Button, Checkbox, Dropdown, Icon, Rating, List, Modal, Radio } from 'semantic-ui-react';

import { isFinished, getFinishText, getFinishedText } from '../../userItems/finishItem';
import statusOptions from '../../userItems/statusOptions';

export default class UserItemDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userItem: props.userItem,
      newUserItem: {},
      completeItemModal: false,
			timeCompleted: 'now',
			timeCompletedCustom: moment(new Date()).format('YYYY-MM-DD')
    }

		this.cancelComplete = this.cancelComplete.bind(this);
		this.completeItem = this.completeItem.bind(this);
		this.confirmCompletion = this.confirmCompletion.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.removeCompletedHistory = this.removeCompletedHistory.bind(this);
		this.updateUserItemValue = this.updateUserItemValue.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({ userItem: props.userItem });
  }

	completeItem(updatedUserItem = undefined) {
    const newUserItem = updatedUserItem || this.state.userItem;

		this.setState({ newUserItem, completeItemModal: true });
	}

	confirmCompletion() {
		const { newUserItem, timeCompleted, timeCompletedCustom } = this.state;

		let date = '';
		switch (timeCompleted) {
			case 'now':
				date = moment(new Date()).format('YYYY-MM-DD');
				break;
			case 'releaseDate':
				date = moment(this.props.item.releaseDate).format('YYYY-MM-DD');
				break;
			case 'Unknown':
				date = 'Unknown';
				break;
			case 'custom':
				date = moment(timeCompletedCustom).format('YYYY-MM-DD');
				break;
			default: break;
		}

		if ((newUserItem.completedHistory || []).length > 0) {
			newUserItem.completedHistory.push(date);
		} else {
			newUserItem.completedHistory = [date];
		}

    this.props.updateUserItem(newUserItem);
    this.setState({ completeItemModal: false });
	}

	cancelComplete() {
		this.setState({ newUserItem: '', completeItemModal: false });
	}

	handleValueChange(field, value) {
		this.setState({ [field]: value });
	}
	
	removeCompletedHistory(dateText) {
		const userItem = this.state.userItem;
		userItem.completedHistory.splice(userItem.completedHistory.indexOf(dateText), 1);
		this.props.updateUserItem(userItem);
	}

  updateUserItemValue(name, value) {
		let userItem = this.state.userItem;
		if (userItem[name] === value) return;
    
    userItem[name] = value;

		if (name === 'status') {
			if (this.props.onChangeStatus) {
				this.props.onChangeStatus(this.props.item);
			}

			if (
				isFinished(this.props.item.type, value) &&
				(userItem.completedHistory || []).length === 0
			) {
				this.completeItem(userItem);
				return;
			}
		}

		this.props.updateUserItem(userItem);
	}
	
  render() {
    const userItem = this.state.userItem;
    const item = this.props.item;

		let completedHistory = null;
		const completedText = userItem ? getFinishedText(item) : '';
		if (userItem && (userItem.completedHistory || []).length > 0) {
			let times = {};
			completedHistory = (
				<div>
					<p>{ completedText }</p>
					<List bulleted>
						{
							userItem.completedHistory.sort().map((dateText, index, list) => {
								times[dateText] = (times[dateText] || 0) + 1;
								if (list.lastIndexOf(dateText) !== index) return null;
								const timesDate = times[dateText];
								const append = timesDate > 1 ? (' x' + timesDate) : '';
								
								return (
									<List.Item key={ index }>
										{ dateText + append }&nbsp;
										<Icon key='icon' name='trash' color='red' onClick={ () => this.removeCompletedHistory(dateText)} />
									</List.Item>
								)
							})
						}
					</List>
					<br />
				</div>
			);
		}

    return (
      <div>
        <Checkbox key='inCollection' label='In Collection' name='inCollection' checked={ userItem.inCollection }
          onChange={(param, data) => this.updateUserItemValue('inCollection', data.checked)} /><br /><br />
        <Rating
          icon='star'
          rating={ userItem.rating }
          maxRating={10}
          clearable
          onRate={(param, data) => this.updateUserItemValue('rating', data.rating)} /><br/><br/>
        <Dropdown
          key='status'
          placeholder='Status'
          selection
          options={statusOptions(item)}
          name='status'
          value={ userItem.status } 
          onChange={(param, data) => this.updateUserItemValue('status', data.value)} />&nbsp;&nbsp;&nbsp;
        {
          isFinished(item.type, userItem.status) &&
          <Button onClick={ () => this.completeItem() }>{ getFinishText(item) } again</Button>
        }
        <br /><br />
        { completedHistory }
        <Modal open={ this.state.completeItemModal } onClose={() => this.cancelComplete()}>
          <Modal.Header>{ getFinishText(item) + ' item' }</Modal.Header>
          <Modal.Content>
            <p>When did you { getFinishText(item) } this item?</p>
            <Radio
              label='Now'
              name='timeCompleted'
              value='now'
              checked={ this.state.timeCompleted === 'now' }
              onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
            <Radio
              label='On release date'
              name='timeCompleted'
              value='releaseDate'
              checked={ this.state.timeCompleted === 'releaseDate' }
              onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
            <Radio
              label={ 'I don\'t remember' }
              name='timeCompleted'
              value='Unknown'
              checked={ this.state.timeCompleted === 'Unknown' }
              onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
            <Radio
              label='Custom Date'
              name='timeCompleted'
              value='custom'
              checked={ this.state.timeCompleted === 'custom' }
              onChange={(param, { value }) => this.handleValueChange('timeCompleted', value)} /><br/>
            {
              this.state.timeCompleted === 'custom' &&
              <input
                type='date'
                max={ moment(new Date()).format('YYYY-MM-DD') }
                value={ moment(new Date()).format('YYYY-MM-DD') }
                onChange={ (e) => this.handleValueChange('timeCompletedCustom', e.target.value) } />
            }
            <br/>
            <Modal.Actions>
              <Button color='black' onClick={() => this.cancelComplete()}>Cancel</Button>
              <Button
                content='Continue'
                labelPosition='right'
                icon='checkmark'
                onClick={() => this.confirmCompletion()}
                positive />
            </Modal.Actions>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}