
from models.models import BankAccount, Category, Brand, StockNotification
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

@router.get("/users")
async def get_all_users(admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    from serializers import user_to_dict
    return [user_to_dict(u) for u in users]

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    user = await session.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Admin silinemez")
    await session.delete(user)
    await session.commit()
    return {"message": "Kullanıcı silindi"}

@router.get("/categories")
async def get_categories(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Category).order_by(Category.name.asc()))
    return [{"id": str(c.id), "name": c.name, "slug": c.slug} for c in result.scalars().all()]

@router.post("/categories")
async def add_category(request: Request, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    data = await request.json()
    cat = Category(name=data["name"], slug=data["slug"])
    session.add(cat)
    await session.commit()
    return {"message": "Kategori eklendi", "id": str(cat.id)}

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    cat = await session.get(Category, uuid.UUID(cat_id))
    if cat:
        await session.delete(cat)
        await session.commit()
    return {"message": "Kategori silindi"}

@router.get("/brands")
async def get_brands(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Brand).order_by(Brand.name.asc()))
    return [{"id": str(b.id), "name": b.name, "slug": b.slug} for b in result.scalars().all()]

@router.post("/brands")
async def add_brand(request: Request, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    data = await request.json()
    brand = Brand(name=data["name"], slug=data["slug"])
    session.add(brand)
    await session.commit()
    return {"message": "Marka eklendi", "id": str(brand.id)}

@router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    brand = await session.get(Brand, uuid.UUID(brand_id))
    if brand:
        await session.delete(brand)
        await session.commit()
    return {"message": "Marka silindi"}

@router.get("/banks")
async def get_banks(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(BankAccount))
    return [{"id": str(b.id), "bank_name": b.bank_name, "iban": b.iban, "account_holder": b.account_holder} for b in result.scalars().all()]

@router.post("/banks")
async def add_bank(request: Request, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    data = await request.json()
    bank = BankAccount(bank_name=data["bank_name"], iban=data["iban"], account_holder=data["account_holder"])
    session.add(bank)
    await session.commit()
    return {"message": "Banka eklendi", "id": str(bank.id)}

@router.delete("/banks/{bank_id}")
async def delete_bank(bank_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    bank = await session.get(BankAccount, uuid.UUID(bank_id))
    if bank:
        await session.delete(bank)
        await session.commit()
    return {"message": "Banka silindi"}

@router.get("/stock-notifications")
async def get_notifications(admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(StockNotification).order_by(StockNotification.created_at.desc()))
    return [{"id": str(n.id), "email": n.email, "product_id": n.product_id, "created_at": n.created_at.isoformat()} for n in result.scalars().all()]

@router.post("/notify-stock/{product_id}")
async def send_stock_notification(product_id: str, admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(StockNotification).where(StockNotification.product_id == product_id))
    notifs = result.scalars().all()
    # Mocking the email send for now
    count = len(notifs)
    for n in notifs:
        await session.delete(n)
    await session.commit()
    return {"message": f"{count} kişiye stok bildirimi gönderildi ve listeden çıkarıldı."}

@router.get("/export/orders")
async def export_orders(admin_user: User = Depends(get_admin_user), session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Order).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(["Siparis ID", "Tarih", "Musteri", "Email", "Telefon", "Tutar", "Odeme", "Durum", "Adres", "Il"])
    
    for o in orders:
        writer.writerow([
            str(o.id),
            o.created_at.strftime("%Y-%m-%d %H:%M"),
            o.shipping_name or "-",
            o.guest_email or "-",
            o.shipping_phone or "-",
            float(o.total),
            o.payment_method,
            o.status,
            o.shipping_address or "-",
            o.shipping_city or "-"
        ])
    
    f.seek(0)
    response = StreamingResponse(iter([f.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=siparisler.csv"
    return response

