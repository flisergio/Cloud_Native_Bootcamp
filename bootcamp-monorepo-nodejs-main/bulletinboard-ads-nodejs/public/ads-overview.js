'use strict'

import { html, useState, useEffect } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
import AdsHeader from './ads-header.js'

const AdsCard = function (props) {
  const ratingStyle = () => {
    if (props.ad.averageContactRating < 2) {
      return 'color: #b00;'
    } else if (props.ad.averageContactRating < 4) {
      return 'color: #e9730c;'
    } else {
      return 'color: #107e3e;'
    }
  }

  const priceAndCurrency = () => `${props.ad.price} ${props.ad.currency}`

  const navToDetails = () => {
    location.hash = `#/show/${props.ad.id}`
  }

  return html`
    <ui5-card class='small' style='margin: 1%; position: relative; width: 12rem; height: 14rem;'>
      <ui5-card-header slot='header' title-text=${props.ad.title} />
      <div style='display: flex; flex-direction: column; align-items: center; margin: 1rem;'>
        <ui5-title style='margin-bottom: 1rem;' level='H3'>${priceAndCurrency()}</ui5-title>
        <ui5-title style=${ratingStyle()} level='H5'>${props.ad.contact}</ui5-title>
      </div>
      <ui5-button onclick=${navToDetails} design='Emphasized' style='position: absolute; bottom: 5%; right: 5%;'>Details</ui5-button>
    </ui5-card>
  `
}

export default function AdsOverview (props) {
  const [state, setState] = useState({ ads: [], message: '' })

  useEffect(async () => {
    setState(await props.client.getAll())
  }, [])

  const navToCreate = () => {
    location.hash = '#/new'
  }

  const clearMessage = () => setState(oldState => ({ ...oldState, message: '' }))

  const ads = state.ads.map(ad => html`<${AdsCard} key=${ad.id} ad=${ad} />`)
  const message = state.message ? html`<ui5-message-strip onclose=${clearMessage} design='Negative' style='margin-top: 1rem;'>${state.message}</ui5-message-strip>` : ''
  return html`
    <ui5-page style='height: 100vh;' floating-footer show-footer>
      <${AdsHeader} slot='header' />
      ${message}
      <div style='display: flex; justify-content: center; margin-top: 1rem;'>
        ${ads}
      </div>
      <ui5-bar slot='footer' design='FloatingFooter'>
        <ui5-button onclick=${navToCreate} icon='add' design='Positive' slot='endContent'></ui5-button>
      </ui5-bar>
    </ui5-page>
  `
}
