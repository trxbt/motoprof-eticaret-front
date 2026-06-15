/**
 * cartTracker.js
 * Terk edilmiş sepet takibi için yardımcı fonksiyonlar.
 * Dokümantasyona uygun: POST /api/cart/track + POST /api/cart/{id}/recover
 */

const API = process.env.REACT_APP_BACKEND_URL;
const SESSION_KEY = 'cart_session_id';
const CART_ID_KEY = 'cart_id';

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

let _timer = null;

/**
 * Sepet değişikliğinde çağrılır. 1.5 sn debounce ile backend'e gönderir.
 * @param {Array}  items   - CartContext'teki items dizisi
 * @param {Object} user    - { id, email, phone, first_name, last_name }
 */
export function trackCart(items = [], user = {}) {
  clearTimeout(_timer);
  _timer = setTimeout(() => {
    const payload = {
      session_id: getSessionId(),
      email:      user?.email   || undefined,
      phone:      user?.phone   || undefined,
      name:       user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined : undefined,
      user_id:    user?.id      || undefined,
      items: items.map(i => ({
        product_id:   i.id || i.product_id,
        product_name: i.name || i.product_name,
        image:        i.image || i.images?.[0] || '',
        price:        Number(i.price),
        quantity:     Number(i.quantity),
        slug:         i.slug || '',
      })),
      subtotal: items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0),
    };

    fetch(`${API}/api/cart/track`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(data => {
        if (data.cart_id) localStorage.setItem(CART_ID_KEY, data.cart_id);
      })
      .catch(() => {});
  }, 1500);
}

/**
 * Ödeme tamamlandığında çağrılır. Cart status → "converted"
 * @param {string} orderId - Oluşturulan sipariş UUID'si
 */
export async function markCartConverted(orderId) {
  const cartId = localStorage.getItem(CART_ID_KEY);
  if (!cartId) return;
  try {
    await fetch(`${API}/api/cart/${cartId}/recover`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ order_id: orderId }),
    });
  } catch (_) {}
  localStorage.removeItem(CART_ID_KEY);
}

/**
 * Recover linki için (?recover=cart_id) cart içeriğini çeker.
 * @param {string} cartId
 */
export async function fetchCartForRecover(cartId) {
  try {
    const r = await fetch(`${API}/api/cart/${cartId}`);
    if (!r.ok) return null;
    return await r.json();
  } catch (_) {
    return null;
  }
}
