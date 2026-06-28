"""
JARVIS - Modul 1: Marktdaten
Ruft aktuelle Kurse von Bitcoin (BTC-USD) und S&P 500 (^GSPC) ab.
"""

import yfinance as yf
from datetime import datetime


def get_price(ticker_symbol: str) -> dict:
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.fast_info
    return {
        "symbol": ticker_symbol,
        "price": info.last_price,
        "currency": info.currency,
    }


def display_market_overview():
    symbols = {
        "Bitcoin": "BTC-USD",
        "S&P 500": "^GSPC",
    }

    print("=" * 50)
    print(f"  JARVIS MARKTDATEN  |  {datetime.now().strftime('%d.%m.%Y %H:%M')}")
    print("=" * 50)

    for name, symbol in symbols.items():
        data = get_price(symbol)
        price = data["price"]
        currency = data["currency"]
        print(f"  {name:<12} {symbol:<10}  {price:>12,.2f} {currency}")

    print("=" * 50)


if __name__ == "__main__":
    display_market_overview()
