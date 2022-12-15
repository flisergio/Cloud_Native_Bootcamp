'use strict'

export default function Client () {
  this.get = async (contact) => {
    const response = await fetch(`./api/v1/reviews/${contact}`)
    return (response.status === 200)
      ? { reviews: await response.json(), message: '' }
      : { reviews: [], message: await response.text() }
  }

  this.create = async (review) => {
    const headers = { 'Content-Type': 'application/json' }
    const response = await fetch('./api/v1/reviews', { method: 'post', headers, body: JSON.stringify(review) })
    return (response.status === 409) ? 'Conflict: a review from this person already exists.' : ''
  }
}
