#!/usr/bin/env python3
"""
Script to get FPT stock price using VNStock library (correct API)
"""

import vnstock as vns
from datetime import datetime, timedelta

def get_fpt_latest_price():
    """Get the latest FPT stock price using vnstock"""
    try:
        print("Getting FPT stock data from VNStock...")
        
        # Get historical data for the last few days
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Use stock_historical_data function
        df = vns.stock_historical_data(symbol='FPT', start_date=start_date, end_date=end_date, resolution='1D', type='stock')
        
        if df is not None and not df.empty:
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
        print(f"Error getting FPT price from VNStock: {e}")
        return None

def get_fpt_intraday():
    """Get FPT intraday data"""
    try:
        print("\nGetting FPT intraday data...")
        
        # Get intraday data
        intraday_df = vns.stock_intraday_data(symbol='FPT', page_num=0, page_size=100)
        
        if intraday_df is not None and not intraday_df.empty:
            print("Recent intraday prices:")
            print(intraday_df.head())
            return intraday_df
        else:
            print("No intraday data available")
            return None
            
    except Exception as e:
        print(f"Error getting intraday data: {e}")
        return None

def get_price_board():
    """Get current price board data"""
    try:
        print("\nGetting price board data...")
        
        # Get price board for FPT
        price_data = vns.price_board('FPT')
        
        if price_data is not None:
            print(f"Price board data: {price_data}")
            return price_data
        else:
            print("No price board data available")
            return None
            
    except Exception as e:
        print(f"Error getting price board: {e}")
        return None

if __name__ == "__main__":
    print("Fetching FPT stock price using VNStock library (Legacy API)...\n")
    
    # Try to get latest historical price
    latest_price = get_fpt_latest_price()
    
    # Try to get intraday data
    intraday = get_fpt_intraday() 
    
    # Try to get price board
    price_board = get_price_board()
    
    print("\n" + "="*50)
    
    if latest_price and latest_price != 'N/A':
        print(f"\n📈 **Latest FPT Close Price: {latest_price:,.0f} VND**")
        print("Source: VNStock Historical Data")
    else:
        print("\n❌ Could not retrieve FPT stock price from VNStock")
        print("This might be due to API limitations or market hours")