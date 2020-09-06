import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import LinkedItems from '../../UI/LinkedItems/LinkedItems';
import ListDetailsItem from './ListDetailsItem';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';
import { getItemsFiltersDefaults, getItemsFiltersControls, getItemsFiltersControlsExtraParams, filterItem } from '../../items/Items/itemsFilters';
import { sortItems, itemsSortDefault, getItemsSortControls } from '../../items/Items/itemsSorting';

export default class ListDetails extends Component {
  constructor() {
    super();
    this.state = {
			confirmationAlert: false,
      redirect: undefined,
			list: {},
			items: [],
      itemOptions: [],
      itemOptionsLoaded: false,
      filterControlsExtraFields: {},
		}
		
    this.removeItem = this.removeItem.bind(this);
		this.toggleConfirmationAlert = this.toggleConfirmationAlert.bind(this);
  }

  componentWillMount() {
    this.init(this.props);
	}
	
	componentWillReceiveProps(props) {
		this.init(props);
	}

	init(props) {
		let titleId = '';
		if (props.list) {
			titleId = props.list.title_id;
		} else if (props.match) {
			titleId = props.match.params.titleId;
		} else {
			this.setState({ redirect: '/' });
			return;
		}

		this.getListDetails(titleId).then(() => {
			this.getItems();
		});

    getItemsFiltersControlsExtraParams().then(filterControlsExtraFields => {
      this.setState({ filterControlsExtraFields });
    });
	}

	getListDetails(titleId) {
		return fetch(`/api/lists/title_id/${titleId}`).then(list => {
			if (!list || list === null) throw new Error('List not found');
			this.setState({ list, items: list.items });
		}).catch(reason => {
			this.setState({redirect: '/'});
		});
	}

	confirmDelete() {
		const listId = this.state.list._id;
		return fetch(`/api/lists/${listId}`, 'delete', true).then(res => {
      if (this.props.onBackCallback) {
        this.props.deleteList(this.state.list);
      } else {
        this.setState({ redirect: '/lists' })
      }
    }).catch(console.log);
	}

	toggleConfirmationAlert() {
		this.setState({ confirmationAlert: !this.state.confirmationAlert });
  }
  
	addItems(itemsToAdd) {
		return fetch(`/api/lists/${this.state.list._id}/items/add`, 'put', true, itemsToAdd);
	}
	
	getItems() {
		fetch('/api/items').then(items => {
      if (!items || items === null) return;
      this.setState({
        itemOptions: 
          items.filter(item => this.state.list.items.map(item => item._id).indexOf(item._id) === -1)
          .sort(sortItems(itemsSortDefault))
          .map(item => { return { key: item._id, value: item._id, text: `${item.title} (${new Date(item.releaseDate).getFullYear()})` } }),
        itemOptionsLoaded: true
      });
		});
	}

  removeItem(item) {
    return fetch(`/api/lists/${this.state.list._id}/items/remove`, 'put', true, [item._id]);
  }

  render() {
    const { redirect, list } = this.state;

    if (redirect) return <Redirect to={ redirect } />;

		let backButtonAttributes = { as: Link, to: '/lists' };
		if (this.props.onBackCallback) {
			backButtonAttributes = { onClick: () => this.props.onBackCallback() };
		}

    return (
      <div>
        <Button labelPosition='left' icon='left chevron' content='Back' { ...backButtonAttributes } />
        <h1>{list.title}</h1>
        <h3>{list.description}</h3>
        <Confirm
					open={ this.state.confirmationAlert }
					header='confirm action'
					content='Are you sure you want to delete this list?'
					onCancel={ this.toggleConfirmationAlert.bind(this) }
					onConfirm={ this.confirmDelete.bind(this) } />
				<LinkedItems
					title='Items'
					options={ this.state.itemOptions }
					optionsLoaded={ this.state.itemOptionsLoaded }
					items={ this.state.items }
					paginatedList={{
						filtersConfig:{
							defaults: getItemsFiltersDefaults(),
							getControls: getItemsFiltersControls(this.state.filterControlsExtraFields),
							filterItem: filterItem
						},
						sortConfig:{
							defaults: itemsSortDefault,
							getControls: getItemsSortControls,
							sortItems: sortItems
						}
					}}
					createItemComponent={ createItemComponent(this.state.list) }
					removeItem={ this.removeItem }
					addItems={ this.addItems.bind(this) }
					parentComponent={ this }
					stateKeyItems='items'
					stateKeyOptions='itemOptions'
					placeholder='Add items' 
					extraAttributes={{ minCharacters:2 }} />
				<br/>
        {
          canEdit(list) && 
          [
            <Button key='edit' positive floated='left' as={Link} to={`/lists/${list.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.toggleConfirmationAlert('delete')}>Delete</Button>	
          ]
				}
      </div>
    );
  }
}

const createItemComponent = (list) => (onDelete) => (item) => {
  return <ListDetailsItem key={ item._id } list={ list } item={ item } onDelete={onDelete} />
}