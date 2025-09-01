#!/usr/bin/env python3
"""
STEP 4: Get SAMPLE data - 1000 hours to verify everything works
"""

import pandas as pd
import requests
import time
from datetime import datetime

def get_sample_1000_hours():
    """Get exactly 1000 hours of recent BTCUSDT data"""
    
    print("📊 GETTING SAMPLE: 1000 hours of BTCUSDT data")
    print("=" * 50)
    
    params = {
        'symbol': 'BTCUSDT',
        'interval': '1h',
        'limit': 1000
    }
    
    print("📡 Making single request for 1000 hours...")
    start_time = time.time()
    
    try:
        response = requests.get("https://api.binance.com/api/v3/klines", params=params, timeout=30)
        
        request_time = time.time() - start_time
        print(f"⏰ Request completed in {request_time:.2f} seconds")
        print(f"📡 Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Failed: {response.text}")
            return None
        
        data = response.json()
        print(f"✅ Got {len(data)} records")
        
        # Convert to DataFrame
        print("📝 Converting to DataFrame...")
        
        columns = [
            'open_time', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
        ]
        
        df = pd.DataFrame(data, columns=columns)
        
        # Convert timestamps to datetime
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
        df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
        
        # Convert prices to float
        price_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in price_cols:
            df[col] = pd.to_numeric(df[col])
        
        # Sort by time
        df = df.sort_values('open_time').reset_index(drop=True)
        
        # Show sample info
        print("\n📈 SAMPLE DATA SUMMARY:")
        print(f"   • Records: {len(df):,}")
        print(f"   • From: {df['open_time'].iloc[0]}")
        print(f"   • To: {df['open_time'].iloc[-1]}")
        print(f"   • Days: {(df['open_time'].iloc[-1] - df['open_time'].iloc[0]).days}")
        print(f"   • Price range: ${df['low'].min():,.2f} - ${df['high'].max():,.2f}")
        print(f"   • Latest price: ${df['close'].iloc[-1]:,.2f}")
        
        # Save to CSV
        output_file = "btcusdt_sample_1000h.csv"
        print(f"\n💾 Saving to {output_file}...")
        df.to_csv(output_file, index=False)
        
        import os
        file_size = os.path.getsize(output_file) / (1024 * 1024)
        print(f"✅ Saved: {file_size:.1f} MB")
        
        # Show first few rows
        print(f"\n📋 First 5 records:")
        print(df[['open_time', 'close', 'volume']].head())
        
        print(f"\n🎯 SAMPLE SUCCESS! Ready to scale up to ALL data.")
        
        return df
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    df = get_sample_1000_hours()
    
    if df is not None:
        print("\n✅ SAMPLE COMPLETE - Ready for full dataset!")
    else:
        print("\n❌ SAMPLE FAILED")