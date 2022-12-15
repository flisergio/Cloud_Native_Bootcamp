'use strict'

import { html, useState, useEffect, useRef } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
import ReviewsHeader from './reviews-header.js'

const NewReviewForm = function (props) {
  const setReviewer = (event) => props.onUpdateReview({ ...props.review, reviewerEmail: event.target.value })
  const setComment = (event) => props.onUpdateReview({ ...props.review, comment: event.target.value })
  const setRating = (event) => props.onUpdateReview({ ...props.review, rating: parseFloat(event.target.value) })

  return html`
    <section>
      <div style='display: grid; margin: 1rem;'>
        <ui5-label required>Reviewer:</ui5-label>
        <ui5-input oninput=${setReviewer}>${props.review.reviewerEmail}</ui5-input>
      </div>
      <div style='display: grid; margin: 1rem;'>
        <ui5-label required>Comment:</ui5-label>
        <ui5-input oninput=${setComment}>${props.review.comment}</ui5-input>
      </div>
      <div style='display: grid; margin: 1rem;'>
        <ui5-label required>Rating:</ui5-label>
        <ui5-input type='Number' oninput=${setRating}>${props.review.rating}</ui5-input>
      </div>
    </section>
  `
}

const Review = function (props) {
  const ratingState = () => {
    if (props.review.rating < 2) {
      return 'Error'
    } else if (props.review.rating < 4) {
      return 'Warning'
    } else {
      return 'Success'
    }
  }
  return html`
    <ui5-li type='Inactive'
            description=${props.review.reviewerEmail}
            additional-text=${props.review.rating}
            additional-text-state=${ratingState()}>
      ${props.review.comment}
    </ui5-li>
  `
}

// REVISE this needs revision, find a way to cleanly separate the entire dialog
export default function ContactReviewss (props) {
  const [state, setState] = useState({ reviews: [], message: '', newReview: {}, messageFromCreation: '' })
  const dialog = useRef({})

  const loadReviews = async () => {
    const contactReviewsResponse = await props.client.get(props.contact)
    setState(oldState => ({ ...oldState, ...contactReviewsResponse }))
  }
  useEffect(loadReviews, [])

  const addReview = () => {
    setState(oldState => ({ ...oldState, newReview: { revieweeEmail: props.contact } }))
    dialog.current.show()
  }

  const reviewEntries = state.reviews.map(review => html`<${Review} key=${review.reviewerEmail} review=${review} />`)
  const reviews = reviewEntries.length > 0
    ? html`<ui5-list>${reviewEntries}</ui5-list>`
    : html`<ui5-title level='H5'>There are no reviews for this contact yet.</ui5-title>`

  const clearMessage = () => setState(oldState => ({ ...oldState, message: '' }))
  const message = state.message
    ? html`
      <ui5-message-strip onclose=${clearMessage} design='Negative' style='margin-top: 1rem;'>
        ${state.message}
      </ui5-message-strip>`
    : ''

  const clearMessageFromCreation = () => setState(oldState => ({ ...oldState, messageFromCreation: '' }))
  const messageFromCreation = state.messageFromCreation
    ? html`
      <ui5-message-strip onclose=${clearMessageFromCreation} design='Negative' style='margin-top: 1rem;'>
        ${state.messageFromCreation}
      </ui5-message-strip>`
    : ''
  const updateNewReview = (newReview) => { setState(oldState => ({ ...oldState, newReview })) }
  const saveNewReview = async () => {
    const messageFromCreation = await props.client.create(state.newReview)
    if (messageFromCreation) {
      setState(oldState => ({ ...oldState, messageFromCreation }))
    } else {
      await loadReviews()
      dialog.current.close()
    }
  }
  const dialogHtml = html`
    <ui5-dialog ref=${dialog} header-text='New Review for ${props.contact}'>
      ${messageFromCreation}
      <${NewReviewForm} review=${state.newReview} onUpdateReview=${updateNewReview} />
      <div slot='footer' style='padding: .5rem'>
        <ui5-button icon='save' design='Emphasized' onclick=${saveNewReview}>Save</ui5-button>
      </div>
    </ui5-dialog>
  `

  return html`
    ${dialogHtml}
    <ui5-page style='height: 100vh;' floating-footer show-footer>
      <${ReviewsHeader} slot='header' />
      ${message}
      <ui5-title level='H3' style='margin-top: 1rem;'>Reviews for ${props.contact}</ui5-title>
      <div style='display: flex; justify-content: center; margin-top: 1rem;'>
        ${reviews}
      </div>
      <ui5-bar slot='footer' design='FloatingFooter'>
        <ui5-button onclick=${addReview} icon='add' design='Positive' slot='endContent'></ui5-button>
      </ui5-bar>
    </ui5-page>
  `
}
