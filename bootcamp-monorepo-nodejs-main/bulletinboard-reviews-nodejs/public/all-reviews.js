'use strict'

import { html, useState, useEffect } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
import ReviewsHeader from './reviews-header.js'

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

  const description = `From ${props.review.reviewerEmail} for ${props.review.revieweeEmail}`

  return html`
    <ui5-li type='Inactive'
            description=${description}
            additional-text=${props.review.rating}
            additional-text-state=${ratingState()}>
      ${props.review.comment}
    </ui5-li>
    `
}

export default function Reviews (props) {
  const [state, setState] = useState({ reviews: [], message: '', newReview: {} })

  const loadReviews = async () => {
    const reviewsResponse = await props.client.get('')
    setState(oldState => ({ ...oldState, ...reviewsResponse }))
  }
  useEffect(loadReviews, [])

  const reviewEntries = state.reviews.map(review => {
    return html`<${Review} key=${review.revieweeEmail + '|' + review.reviewerEmail} review=${review} />`
  })
  const reviews = reviewEntries.length > 0
    ? html`<ui5-list>${reviewEntries}</ui5-list>`
    : html`<ui5-title level='H5'>There are no reviews yet.</ui5-title>`

  const clearMessage = () => setState(oldState => ({ ...oldState, message: '' }))
  const message = state.message
    ? html`
      <ui5-message-strip onclose=${clearMessage} design='Negative' style='margin-top: 1rem;'>
        ${state.message}
      </ui5-message-strip>`
    : ''

  return html`
    <ui5-page style='height: 100vh;' floating-footer show-footer>
      <${ReviewsHeader} slot='header' />
      ${message}
      <ui5-title level='H3' style='margin-top: 1rem;'>All Reviews</ui5-title>
      <div style='display: flex; justify-content: center; margin-top: 1rem;'>
        ${reviews}
      </div>
    </ui5-page>
  `
}
