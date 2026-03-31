#!/usr/bin/env python3
"""
Script to get FPT stock price using VNStocks library
"""

import sys
import os
from datetime import datetime, timedelta

# Add user site-packages to Python path
import site
sys.path.append(site.getusersitepackages())

def get_fpt_latest_price():
    """Get the latest FPT stock price"""
    try:
        from vnstock import Vnstock
        # Initialize VNStock
        stock = Vnstock().stock(symbol='FPT', source='VCI')
        
        # Get current date and yesterday for latest data
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Get historical data (last few days to get most recent)
        df = stock.quote.history(symbol='FPT', start=start_date, end=end_date)
        
        if not df.empty:
            # Get the latest record
            latest = df.iloc[-1]
            
            print(f"=== FPT Corporation (FPT) Latest Price ===")
            print(f"Date: {latest.name if hasattr(latest, 'name') else 'Latest'}")
            print(f"Open: {latest.get('open', 'N/A'):,.0f} VND")
            print(f"High: {latest.get('high', 'N/A'):,.0f} VND")
            print(f"Low: {latest.get('low', 'N/A'):,.0f} VND")
            print(f"Close: {latest.get('close', 'N/A'):,.0f} VND")
            print(f"Volume: {latest.get('volume', 'N/A'):,}")
            
            return latest.get('close', 'N/A')
        else:
            print("No recent data available for FPT")
            return None
            
    except Exception as e:
        print(f"Error getting FPT price from VNStocks: {e}")
        return None
    
def get_fpt_quote():
    """Get FPT real-time quote if available"""
    try:
        from vnstock import Vnstock
        stock = Vnstock().stock(symbol='FPT', source='VCI')
        quote = stock.quote.intraday(symbol='FPT')
        
        if quote is not None:
            print(f"Real-time quote: {quote}")
            return quote
        else:
            print("Real-time quote not available")
            return None
            
    except Exception as e:
        print(f"Error getting real-time quote: {e}")
        return None

if __name__ == "__main__":
    print("Fetching FPT stock price using VNStocks library...")
    
    # Try to get latest price
    latest_price = get_fpt_latest_price()
    
    # Try to get real-time quote
    print("\n" + "="*50)
    quote = get_fpt_quote()
    
    if latest_price:
        print(f"\n📈 **Latest FPT Close Price: {latest_price:,.0f} VND**")