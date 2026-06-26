(async () => {
  const base = 'http://localhost:3000'
  const waitFor = async (ms) => new Promise(r => setTimeout(r, ms))

  async function waitForHealth(retries = 30) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(base + '/api/health')
        if (res.ok) return true
      } catch (e) {}
      await waitFor(1000)
    }
    return false
  }

  const ready = await waitForHealth()
  if (!ready) { console.error('Server did not become ready within timeout'); process.exit(2) }
  console.log('Health OK')

  // Login
  const loginRes = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testuser@example.com', password: 'password123' }),
  })
  console.log('LOGIN', loginRes.status)
  console.log('RESPONSE HEADERS:')
  for (const [k, v] of loginRes.headers.entries()) console.log('  ', k, ':', v)
  const setCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie')
  console.log('SET-COOKIE:', !!setCookie)
  const cookie = setCookie ? setCookie.split(';')[0] : ''

  // Create property
  let res = await fetch(base + '/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ name: 'Sanity Property', location: 'Test City', totalUnits: 2, occupiedUnits: 1, monthlyRevenue: 500 }),
  })
  console.log('CREATE PROPERTY', res.status)
  const createdProp = await res.json().catch(() => null)
  console.log('PROPERTY BODY', createdProp)
  const propId = createdProp?.id

  // Update property
  if (propId) {
    res = await fetch(base + '/api/properties/' + propId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ name: 'Sanity Property Updated', monthlyRevenue: 600 }),
    })
    console.log('UPDATE PROPERTY', res.status, await res.text().catch(() => null))

    // Delete property
    res = await fetch(base + '/api/properties/' + propId, {
      method: 'DELETE',
      headers: { 'Cookie': cookie },
    })
    console.log('DELETE PROPERTY', res.status, await res.text().catch(() => null))
  }

  // Create tenant
  res = await fetch(base + '/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ name: 'Sanity Tenant', initials: 'ST', unit: '1A', propertyId: propId || 'p_dummy', propertyName: 'Sanity Property', rent: 200 }),
  })
  console.log('CREATE TENANT', res.status)
  const createdTenant = await res.json().catch(() => null)
  const tenantId = createdTenant?.id

  if (tenantId) {
    // Update tenant
    res = await fetch(base + '/api/tenants/' + tenantId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ name: 'Sanity Tenant Updated' }),
    })
    console.log('UPDATE TENANT', res.status, await res.text().catch(() => null))

    // Delete tenant
    res = await fetch(base + '/api/tenants/' + tenantId, {
      method: 'DELETE',
      headers: { 'Cookie': cookie },
    })
    console.log('DELETE TENANT', res.status, await res.text().catch(() => null))
  }

  // Create payment
  res = await fetch(base + '/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
    body: JSON.stringify({ tenantId: tenantId || 't_dummy', tenant: 'Sanity Tenant', unit: '1A', amount: 150, method: 'cash', ref: 'ref123', status: 'pending', date: 'Today', period: 'June' }),
  })
  console.log('CREATE PAYMENT', res.status)
  const createdPayment = await res.json().catch(() => null)
  const paymentId = createdPayment?.id

  if (paymentId) {
    // Confirm payment
    res = await fetch(base + '/api/payments/' + paymentId + '/confirm', {
      method: 'PATCH',
      headers: { 'Cookie': cookie },
    })
    console.log('CONFIRM PAYMENT', res.status, await res.text().catch(() => null))

    // Delete payment
    res = await fetch(base + '/api/payments/' + paymentId, {
      method: 'DELETE',
      headers: { 'Cookie': cookie },
    })
    console.log('DELETE PAYMENT', res.status, await res.text().catch(() => null))
  }

  console.log('Sanity checks complete')
  process.exit(0)
})()
