import asyncio
from database import engine
from sqlalchemy import text

async def run():
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT * FROM bank_accounts;'))
        print(res.fetchall())

asyncio.run(run())
