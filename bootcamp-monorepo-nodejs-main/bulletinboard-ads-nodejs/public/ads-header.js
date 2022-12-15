'use strict'

import { html } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'

export default function AdsHeader () {
  const navToOverview = () => {
    location.hash = '#/'
  }

  return html`
    <ui5-shellbar primary-title='Bulletin Board' secondary-title='Advertisements'>
        <ui5-button icon='home' slot='startButton' onclick=${navToOverview}></ui5-button>
    </ui5-shellbar>
  `
}
