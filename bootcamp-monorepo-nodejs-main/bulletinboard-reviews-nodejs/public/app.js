'use strict'

import { html, useState, useEffect } from 'https://unpkg.com/htm@3.1.0/preact/standalone.module.js'
import ContactReviews from './contact-reviews.js'
import AllReviews from './all-reviews.js'

// FIXME changing the hash directly to another contact does not reload the reviews
const App = function (props) {
  const [state, setState] = useState({ contact: location.hash.substring(10) })

  useEffect(() => {
    addEventListener('hashchange', setStateFromUrl)
    return () => removeEventListener('hashchange', setStateFromUrl)
  }, [])

  const setStateFromUrl = () => setState({ contact: location.hash.substring(10) })

  return state.contact
    ? html`<${ContactReviews} client=${props.client} contact=${state.contact} />`
    : html`<${AllReviews} client=${props.client} />`
}

export default App
