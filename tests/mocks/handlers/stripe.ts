import { http, HttpResponse } from 'msw'

export const stripeHandlers = [
  // Create customer
  http.post('https://api.stripe.com/v1/customers', () => {
    return HttpResponse.json({
      id: 'cus_test123',
      object: 'customer',
      email: 'test@example.com',
    })
  }),

  // Create checkout session
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test123',
      object: 'checkout.session',
      url: 'https://checkout.stripe.com/c/pay/cs_test123',
    })
  }),

  // Retrieve subscription
  http.get('https://api.stripe.com/v1/subscriptions/:id', () => {
    return HttpResponse.json({
      id: 'sub_test123',
      object: 'subscription',
      status: 'active',
    })
  }),
]
