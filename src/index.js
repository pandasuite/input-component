import PandaBridge from 'pandasuite-bridge';

import debounce from 'lodash/debounce';

let properties = null;

function validate() {
  const queryable = {
    inputValue: document.getElementById('text').value,
  };

  PandaBridge.send(PandaBridge.UPDATED, { queryable });
  PandaBridge.send('onValidated', [queryable]);
}

function focused() {
  const queryable = {
    inputValue: document.getElementById('text').value,
  };

  PandaBridge.send('onFocused', [queryable]);
}

function myInit() {
  const textEl = document.getElementById('text');

  if (properties && properties.debounce) {
    textEl.oninput = debounce(() => {
      validate();
    },
    properties.debounceTime || 300);
  }
  textEl.onfocus = focused;
  textEl.style.fontSize = `${properties.textSize}px`;
  textEl.style.textAlign = properties.textAlign;
  textEl.style.color = properties.textColor;
  if (properties.placeholder) {
    textEl.placeholder = properties.placeholder;
  }
  textEl.value = properties.content;
}

PandaBridge.init(() => {
  PandaBridge.onLoad((pandaData) => {
    properties = pandaData.properties;
    myInit();
  });

  PandaBridge.onUpdate((pandaData) => {
    properties = pandaData.properties;
    myInit();
  });

  PandaBridge.listen('validate', () => {
    validate();
  });

  PandaBridge.listen('setText', ([props]) => {
    const { text } = props || {};

    document.getElementById('text').value = text || '';
  });

  PandaBridge.listen('clearText', () => {
    document.getElementById('text').value = '';
  });

  PandaBridge.listen('focusText', () => {
    document.getElementById('text').focus();
  });
});
