export const capitalizeFirstLetter = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const createLabel = (text) => capitalizeFirstLetter(text.split(/(?=[A-Z])/).join(' '));