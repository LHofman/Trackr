import getItemsFilterDefaults from "../../items/Items/getItemsFilterDefaults"

export default () => { return {
  ...getItemsFilterDefaults(),
  inCollection: '',
  status: ''
}}