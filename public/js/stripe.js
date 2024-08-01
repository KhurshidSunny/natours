/* eslint-disable */

const stripe = Stripe(
  'pk_test_51PiabkBzc9K8C5xnAi34CYDnWDbsblACPubT9lgwds7kvlcCI6VwRQJg0H0rBhR5RLE8tBSAZrDcResVsEur0JFt00K1OsF3se',
);

const bookTour = async (tourId) => {
  try {
    // 1: Get the checkout session from the API
    const session = await fetch(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    const data = await session.json();
    // 2: Create checkout form + charge the debit card
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
