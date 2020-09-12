import React, { Component } from "react";
import { Button, Dropdown, List } from "semantic-ui-react";
import PaginatedList from "../PaginatedList/PaginatedList";

export default class LinkedItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addItems: [],
      options: this.props.options || [],
      items: this.props.items || []
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ 
      addItems: [],
      items: newProps.items || [],
      options: newProps.options || []
    });
  }

	handleValueChange(e, { value }) {
		this.setState({ addItems: value })
	}

	addItems() {
    this.props.addItems(this.state.addItems).then(completeItems => {
      const items = this.state.items;
      items.push(...completeItems);

      const completeItemsIds = completeItems.map(item => item._id);
      
      this.props.parentComponent.setState({ 
        [this.props.stateKeyItems]: items,
        [this.props.stateKeyOptions]: this.state.options.filter(item => completeItemsIds.indexOf(item.key) === -1)
      });
    });
	}
  
  //Need to set state in parent component
  removeItem(item) {
    this.props.removeItem(item).then(() => {
      const options = this.state.options
      options.push({ key: item._id, value: item._id, text: item.title })

      this.props.parentComponent.setState({
        [this.props.stateKeyOptions]: options
      });
    });
  }

  render() {
    const {
      props: {
        extraAttributes,
        optionsLoaded,
        placeholder
      },
      state: {
        addItems,
        options
      }
    } = this;

    let itemsList = null;
    
    if (this.state.items && this.state.items.length) {
      const items = this.state.items;
      const createItemComponent = this.props.createItemComponent(this.removeItem.bind(this));

      if (this.props.paginatedList) {
        itemsList = (
          <div>
            <br/><br/>
            <PaginatedList
              title=''
              items={ items }
              createItemComponent={ createItemComponent }
              { ...this.props.paginatedList } />
          </div>
        );
      } else {
        itemsList = (
          <List bulleted>
            {
              items.sort((i1, i2) => i1.title.toLowerCase() < i2.title.toLowerCase() ? -1 : 1)
                .map(this.props.createItemComponent(this.removeItem.bind(this)))
            }
          </List>
        );
      }
    }
    
    return (
      <div>
        <h2>{ this.props.title }</h2>
        {
          this.props.addItems &&
          <div>
            <Dropdown
              placeholder={placeholder}
              selection multiple search
              loading={!optionsLoaded}
              { ...extraAttributes }
              options={options}
              value={addItems}
              onChange={ this.handleValueChange.bind(this) } />
            &nbsp;&nbsp;&nbsp;
            <Button onClick={this.addItems.bind(this)}>Add</Button>
          </div>
        }
        {itemsList}
      </div>
    );
  }
}