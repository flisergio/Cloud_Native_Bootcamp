'use strict'

import { html } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'

export default function ReviewsHeader () {
  const navToOverview = () => {
    location.hash = '#/reviews/'
  }

  return html`
    <ui5-shellbar primary-title='Bulletin Board' secondary-title='Reviews'>
      <ui5-button icon='home' slot='startButton' onclick=${navToOverview}></ui5-button>
    </ui5-shellbar>
  `
}
