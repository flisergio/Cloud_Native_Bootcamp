'use strict'

export default function Client () {
  this.getAll = async () => {
    const response = await fetch('./api/v1/ads')
    return (response.status === 200)
      ? { ads: (await response.json()), message: '' }
      : { ads: [], message: await response.text() }
  }

  this.get = async (id) => {
    const response = await fetch(`./api/v1/ads/${id}`)
    return (response.status === 200)
      ? { ad: await response.json(), message: '' }
      : { ad: {}, message: await response.text() }
  }

  this.delete = async (id) => {
    const response = await fetch(`./api/v1/ads/${id}`, { method: 'delete' })
    return (response.status === 204) ? '' : response.text()
  }

  this.create = async (ad) => {
    const headers = { 'Content-Type': 'application/json' }
    const response = await fetch('./api/v1/ads', { method: 'post', headers, body: JSON.stringify(ad) })
    return (response.status === 201) ? '' : response.text()
  }

  this.update = async (ad) => {
    const headers = { 'Content-Type': 'application/json' }
    const response = await fetch(`./api/v1/ads/${ad.id}`, { method: 'put', headers, body: JSON.stringify(ad) })
    return (response.status === 200) ? '' : response.text()
  }
}
