# Let Them Draw - Website

This is the website for Let Them Draw, a service that allows users to commission custom drawings from artists.

It's built with [Next.js](https://nextjs.org), a React framework.

For an overview of the app, see [let-them-draw-infrastructure](https://github.com/danielwohlgemuth/let-them-draw-infrastructure).

![requests](/assets/requests.png)

![request detail done](/assets/request-detail-done.png)

## Setup

Copy the `example.env` file to `.env` and fill in the values.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## Usage

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To try out the payment flow, use the card number `4242 4242 4242 4242`, use a future expiration date, and a CVV of `123`.

See [Stripe Testing Cards](https://docs.stripe.com/testing#cards) for additional cards to test with.