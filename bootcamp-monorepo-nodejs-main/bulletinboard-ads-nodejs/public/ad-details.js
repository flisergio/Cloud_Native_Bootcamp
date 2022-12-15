'use strict'

import { html, useState, useEffect } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
import AdsHeader from './ads-header.js'

const AdCard = function (props) {
  const update = (property, value) => {
    const ad = { ...props.ad }
    ad[property] = value
    props.onUpdateAd(ad)
  }
  const setTitle = (event) => update('title', event.target.value)
  const setPrice = (event) => update('price', parseFloat(event.target.value))
  const setCurrency = (event) => update('currency', event.target.value)
  const setContact = (event) => update('contact', event.target.value)
  let ratingText = ''
  if (props.ad.averageContactRating < 2) {
    ratingText = 'poor or none'
  } else if (props.ad.averageContactRating < 4) {
    ratingText = 'good'
  } else {
    ratingText = 'excellent'
  }
  const rating = !props.isEdit
    ? html`
      <div style='margin: 1rem;'>
        <ui5-label for='rating' style='width: 100%'>Contact Rating</ui5-label>
          <ui5-text id='rating' >${Math.round(100 * props.ad.averageContactRating) / 100} (${ratingText})</ui5-text>
          <br/>
          <ui5-link href=${props.ad.reviewsUrl} target='_blank'>Go to user reviews</ui5-link>
      </div>`
    : ''

  return html`
    <ui5-card style='margin-top: 1rem;' class='small'>
      <ui5-card-header slot='header' title-text=${props.ad.title} />
      <div style='display: flex; flex-direction: column;'>
        <div style='margin: 1rem; display: grid;'>
          <ui5-label required>Title</ui5-label>
          <ui5-input disabled=${!props.isEdit} value=${props.ad.title} oninput=${setTitle} />
        </div>
        <div style='margin: 1rem; display: grid;'>
          <ui5-label required>Price</ui5-label>
          <ui5-input type='Number' disabled=${!props.isEdit} value=${props.ad.price} oninput=${setPrice} />
        </div>
        <div style='margin: 1rem; display: grid;'>
          <ui5-label required>Currency</ui5-label>
          <ui5-input disabled=${!props.isEdit} value=${props.ad.currency} oninput=${setCurrency} />
        </div>
        <div style='margin: 1rem; display: grid;'>
          <ui5-label required>Contact</ui5-label>
          <ui5-input disabled=${!props.isEdit} value=${props.ad.contact} oninput=${setContact} />
        </div>
        ${rating}
      </div>
    </ui5-card>
    `
}

export default function AdDetails (props) {
  const [state, setState] = useState({ ad: { title: '', price: '', currency: '', contact: '' }, initialAd: {}, isEdit: false, message: '' })

  useEffect(async () => {
    if (!props.isCreate) {
      const { ad, message } = await props.client.get(props.adId)
      setState({ ...state, ad, initialAd: JSON.parse(JSON.stringify(ad)), message })
    } else {
      setState({ ...state, isEdit: true })
    }
  }, [])

  const clearMessage = () => setState(oldState => ({ ...oldState, message: '' }))

  const updateAd = (ad) => {
    setState(oldState => ({ ...oldState, ad }))
  }

  const cancel = () => {
    setState(oldState => ({ ...oldState, isEdit: false }))
    if (props.isCreate) {
      location.hash = '#/'
    } else {
      setState(oldState => ({ ...oldState, ad: JSON.parse(JSON.stringify(state.initialAd)) }))
    }
  }

  const edit = () => setState(oldState => ({ ...oldState, isEdit: true }))

  const del = async () => {
    const message = await props.client.delete(props.adId)
    setState(oldState => ({ ...oldState, message }))
    if (!message) {
      location.hash = '#/'
    }
  }

  const save = async () => {
    const message = props.isCreate ? await props.client.create(state.ad) : await props.client.update(state.ad)
    setState(oldState => ({ ...oldState, message }))
    if (!message) {
      location.hash = '#/'
    }
  }

  const message = state.message
    ? html`<ui5-message-strip onclose=${clearMessage} design='Negative' style='margin-top: 1rem;'>${state.message}</ui5-message-strip>`
    : ''

  const buttons = state.isEdit
    ? html`
      <ui5-button onclick=${save} icon='save' slot='endContent' />
      <ui5-button onclick=${cancel} icon='cancel' design='Negative' slot='endContent' />`
    : html`
      <ui5-button onclick=${edit} icon='edit' slot='endContent' />
      <ui5-button onclick=${del} icon='delete' design='Negative' slot='endContent' />`

  return html`
    <ui5-page style='height: 100vh;' floating-footer show-footer>
      <${AdsHeader} slot='header' />
      ${message}
      <${AdCard} ad=${state.ad} onUpdateAd=${updateAd} isEdit=${state.isEdit} />
      <ui5-bar slot='footer' design='FloatingFooter'>${buttons}</ui5-bar>
    </ui5-page>
  `
}
