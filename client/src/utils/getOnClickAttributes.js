const onHeaderClick = (props, item) => (e) => {
  if (e.ctrlKey) return;
  e.preventDefault();
  props.onClickCallback(item);
}

export default (url, props, item) => {
  let onClickAttributes = {href: url};

  if (props.onClickCallback) {
    onClickAttributes.onClick = onHeaderClick(props, item);
  }

  return onClickAttributes;
}
