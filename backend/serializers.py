from models.models import User, Product, Order


def user_to_dict(u: User) -> dict:
    return {
        "id": str(u.id), "email": u.email, "name": u.name,
        "role": u.role, "created_at": u.created_at.isoformat(),
    }


def product_to_dict(p: Product) -> dict:
    imgs = p.images if p.images else ([p.image] if p.image else [])
    return {
        "id": str(p.id), "name": p.name, "slug": p.slug,
        "description": p.description, "price": float(p.price),
        "original_price": float(p.original_price) if p.original_price else None,
        "image": p.image, "images": imgs, "brand": p.brand, "model": p.model,
        "model_id": p.model_id, "year_range": p.year_range, "category": p.category,
        "stock": p.stock, "sku": p.sku, "oem_kodu": p.oem_kodu,
        "is_featured": p.is_featured,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def order_to_dict(o: Order) -> dict:
    return {
        "id": str(o.id), "user_id": str(o.user_id) if o.user_id else None,
        "guest_email": o.guest_email, "total": float(o.total),
        "shipping_name": o.shipping_name, "shipping_phone": o.shipping_phone,
        "shipping_address": o.shipping_address, "shipping_city": o.shipping_city,
        "status": o.status, "payment_status": o.payment_status,
        "invoice": o.invoice, "coupon_code": o.coupon_code,
        "discount": float(o.discount) if o.discount else None,
        "items": [
            {
                "id": str(i.id), "product_id": i.product_id,
                "product_name": i.product_name, "product_image": i.product_image,
                "price": float(i.price), "quantity": i.quantity,
            }
            for i in o.items
        ],
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }
