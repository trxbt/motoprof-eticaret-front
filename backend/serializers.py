from models.models import User, Product, Order, Address


def user_to_dict(u: User) -> dict:
    return {
        "id": str(u.id), "email": u.email, "name": u.name,
        "role": u.role, "cart_data": u.cart_data if u.cart_data else [],
        "created_at": u.created_at.isoformat(),
    }


def product_to_dict(p: Product) -> dict:
    imgs = p.images if p.images else ([p.image] if p.image else [])
    # image_url: admin paneli image_url bekliyor, bunu image'dan türet
    image_url = p.image or (imgs[0] if imgs else None)
    return {
        "id": str(p.id), "name": p.name, "slug": p.slug,
        "description": p.description, "price": float(p.price),
        "original_price": float(p.original_price) if p.original_price else None,
        "image": p.image, "images": imgs,
        "image_url": image_url,
        "brand": p.brand, "model": p.model,
        "model_id": p.model_id, "year_range": p.year_range, "category": p.category,
        "stock": p.stock, "sku": p.sku, "oem_kodu": p.oem_kodu,
        "is_featured": p.is_featured,
        "meta_title": getattr(p, "meta_title", None),
        "meta_description": getattr(p, "meta_description", None),
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def order_to_dict(o: Order) -> dict:
    return {
        "id": str(o.id), "user_id": str(o.user_id) if o.user_id else None,
        "guest_email": o.guest_email, "total": float(o.total),
        "shipping_name": o.shipping_name, "shipping_phone": o.shipping_phone,
        "shipping_address": o.shipping_address, "shipping_city": o.shipping_city,
        "status": o.status, "payment_status": o.payment_status,
        "payment_method": getattr(o, "payment_method", "iyzico"),
        "tracking_number": getattr(o, "tracking_number", None),
        "admin_note": getattr(o, "admin_note", None),
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


def address_to_dict(a: Address) -> dict:
    return {
        "id": str(a.id), "title": a.title, "name": a.name,
        "phone": a.phone, "address": a.address, "city": a.city,
        "district": a.district, "is_default": a.is_default,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
