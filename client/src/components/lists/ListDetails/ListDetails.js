import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Button, Confirm } from 'semantic-ui-react';

import LinkedItems from '../../UI/LinkedItems/LinkedItems';
import ListDetailsItem from './ListDetailsItem';

import canEdit from '../../../utils/canEdit';
import fetch from '../../../utils/fetch';
import { getItemsFiltersDefaults, getItemsFiltersControls, getItemsFiltersControlsExtraParams, filterItem } from '../../../utils/items/itemsFilters';
import { sortItems, getItemsSortControls } from '../../../utils/items/itemsSorting';

import { SET_LISTS_ITEMS_LIST_FILTERS, SET_LISTS_ITEMS_LIST_PAGE, SET_LISTS_ITEMS_LIST_SORTING } from '../../../store/lists/actions';
import { ITEMS_LIST_FILTERS, ITEMS_LIST_PAGE, ITEMS_LIST_SORTING } from '../../../store/lists/keys';


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
			changingOrder: false
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
			this.setState({ list, items: list.items.map((item) => { return { ...item.item, itemModel: item.itemModel } }) });
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
		const items = itemsToAdd.map((item) => { return { item, itemModel: this.state.allItemsTypes[item] } });
		return fetch(`/api/lists/${this.state.list._id}/items/add`, 'put', true, items);
	}
	
	getItems() {
		Promise.all([
			fetch('/api/items'),
			fetch('/api/franchises')
		]).then(itemsArray => {
			const itemsItems = itemsArray[0].map((item) => { return { ...item, type: 'Item' } });
			const itemsFranchises = itemsArray[1].map((franchise) => { return { ...franchise, title: `${franchise.title} (Franchise)`, type: 'Franchise' } });
			const items = [ ...itemsItems, ...itemsFranchises ];
      this.setState({
				allItemsTypes: items.reduce((map, item) => { return { ...map, [item._id]: item.type } }),
        itemOptions: 
					items.filter(item => this.state.items.map(item => item._id).indexOf(item._id) === -1)
					.sort((i1, i2) => i1.title <= i2.title ? -1 : 1)
          .map(item => {
						let text = item.title;
						if (item.releaseDate) {
							text += ` (${new Date(item.releaseDate).getFullYear()})`;
						}
						return {
							key: item._id,
							value: item._id,
							text
						};
					}),
        itemOptionsLoaded: true
      });
		});
	}

  removeItem(item) {
    return fetch(`/api/lists/${this.state.list._id}/items/remove`, 'put', true, [item._id]).then(() => {
			const items = this.state.items.filter(itemB => itemB._id !== item._id);
			this.setState({ items });
		});
	}
	
	startChangeOrder() {
		this.setState({ changingOrder: true });
	}

	saveOrder() {
		const list = this.state.list;
		list.items = this.state.items.map((item) => { return { item, itemModel: item.itemModel } });
    fetch(`/api/lists/${list._id}`, 'put', true, list).then(() => {
			this.setState({ changingOrder: false });
		});
	}

	changeIndex(originalIndex, newIndex) {
		const items = this.state.items;
		const changedItem = items.splice(originalIndex - 1, 1);
		items.splice(newIndex - 1, 0, changedItem[0]);
		console.log(items);
		this.setState({ items });
	}

  render() {
    const {
			changingOrder,
			list,
			redirect
		} = this.state;

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
					items={ this.state.items.map((item, index) => { return { ...item, index: index + 1 } }) }
					paginatedList={{
						parentTitle: this.state.list.title_id,
						filtersConfig:{
							defaults: getItemsFiltersDefaults(),
							getControls: getItemsFiltersControls(this.state.filterControlsExtraFields),
							filterItem: filterItem,
							action: SET_LISTS_ITEMS_LIST_FILTERS,
							listKey: ITEMS_LIST_FILTERS
						},
						sortConfig:{
							defaults: { field: 'index', order: 'asc' },
							getControls: getItemsSortControls(['index']),
							sortItems: sortItems,
							action: SET_LISTS_ITEMS_LIST_SORTING,
							listKey: ITEMS_LIST_SORTING
						},
						paginationConfig: {
							action: SET_LISTS_ITEMS_LIST_PAGE,
							listKey: ITEMS_LIST_PAGE
						},
						startChangeOrder: this.startChangeOrder.bind(this),
						saveOrder: this.saveOrder.bind(this),
						reducer: 'lists'
					}}
					createItemComponent={ createItemComponent(list, changingOrder, this.changeIndex.bind(this)) }
					removeItem={ this.removeItem }
					addItems={ changingOrder ? false : this.addItems.bind(this) }
					parentComponent={ this }
					stateKeyItems='items'
					stateKeyOptions='itemOptions'
					placeholder='Add items' 
					extraAttributes={{ minCharacters:2 }} />
				<br/>
        {
          (canEdit(list) && !changingOrder) &&
          [
            <Button key='edit' positive floated='left' as={Link} to={`/lists/${list.title_id}/edit`}>Edit</Button>,
						<Button key='delete' negative floated='right' onClick={() => this.toggleConfirmationAlert('delete')}>Delete</Button>	
          ]
				}
      </div>
    );
  }
}

const createItemComponent = (list, changingOrder, changeIndex) => (onDelete) => (item) => {
	return (
		<ListDetailsItem
			key={item._id}
			list={list}
			changingOrder={changingOrder}
			changeIndex={changeIndex}
			onDelete={onDelete}
			item={item} />
	);
}