import PandaBridge from 'pandasuite-bridge';

import debounce from 'lodash/debounce';
import set from 'lodash/set';

let properties = null;

function sendEvent(value) {
  const data = {};

  set(data, properties.key || 'value', value);
  PandaBridge.send('sent', [data]);
}

function validate(erase = true) {
  const text = document.getElementById('text').value;

  sendEvent(text);
  if (erase) {
    document.getElementById('text').value = '';
  }
}

function myInit() {
  const textEl = document.getElementById('text');

  if (properties && properties.debounce) {
    textEl.oninput = debounce(() => {
      validate(false);
    },
    properties.debounceTime || 300);
  }
  textEl.style.fontSize = `${properties.textSize}px`;
  textEl.style.color = properties.textColor;
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
});
