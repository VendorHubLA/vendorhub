import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function createConnectedAccount(email: string, vendorName: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
    business_type: 'company',
    company: { name: vendorName },
    capabilities: {
      transfers: { requested: true },
    },
  })
}

export async function createAccountLink(accountId: string, baseUrl: string) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/vendors/connect/refresh`,
    return_url: `${baseUrl}/vendors/connect/success`,
    type: 'account_onboarding',
  })
}

export async function createMilestonePaymentIntent(
  amount: number,
  vendorStripeAccountId: string,
  projectId: string,
  milestoneId: string
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    payment_method_types: ['card'],
    transfer_data: {
      destination: vendorStripeAccountId,
    },
    metadata: { projectId, milestoneId },
  })
}

export async function releaseMilestonePayment(
  paymentIntentId: string,
  vendorStripeAccountId: string,
  amount: number
) {
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    destination: vendorStripeAccountId,
    source_transaction: paymentIntentId,
  })
}
