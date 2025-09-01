#!/usr/bin/env python3
"""
PRACTICAL APPROACH: Get 6 months of recent BTCUSDT data
Perfect for backtesting, guaranteed to work
"""

import pandas as pd
import requests
import time
from datetime import datetime
import os

def get_btcusdt_6_months():
    """Get 6 months of recent BTCUSDT hourly data"""
    
    print("🎯 PRACTICAL APPROACH: Getting 6 months of BTCUSDT data")
    print("=" * 60)
    print("📊 6 months × 30 days × 24 hours = ~4,320 hours")
    print("📦 At 1000 per batch = ~5 batches = ~1 second total")
    
    all_data = []
    target_hours = 6 * 30 * 24  # 6 months worth
    batches_needed = (target_hours // 1000) + 1
    
    print(f"🎯 Target: {target_hours} hours in {batches_needed} batches")
    
    current_end_time = None
    batch_count = 0
    
    start_time = time.time()
    
    while len(all_data) < target_hours and batch_count < 10:  # Safety limit
        batch_count += 1
        
        params = {
            'symbol': 'BTCUSDT', 
            'interval': '1h',
            'limit': 1000
        }
        
        if current_end_time:
            params['endTime'] = current_end_time
        
        print(f"📡 Batch {batch_count}/~{batches_needed}...", end=" ")
        
        try:
            response = requests.get("https://api.binance.com/api/v3/klines", params=params, timeout=30)
            
            if response.status_code != 200:
                print(f"❌ Status: {response.status_code}")
                break
                
            data = response.json()
            
            if not data:
                print("✅ Done!")
                break
                
            all_data.extend(data)
            print(f"✅ +{len(data)} | Total: {len(all_data):,}")
            
            # Set up for next batch
            first_time = data[0][0]  # First record's open time
            current_end_time = first_time - 1
            
            time.sleep(0.1)  # Be nice to API
            
        except Exception as e:
            print(f"❌ Error: {e}")
            break
    
    elapsed = time.time() - start_time
    print(f"\n⏰ Completed in {elapsed:.1f} seconds")
    print(f"📊 Collected {len(all_data):,} records")
    
    # Convert to DataFrame
    print("📝 Converting to DataFrame...")
    
    columns = [
        'open_time', 'open', 'high', 'low', 'close', 'volume',
        'close_time', 'quote_asset_volume', 'number_of_trades',
        'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
    ]
    
    df = pd.DataFrame(all_data, columns=columns)
    
    # Convert timestamps
    df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
    df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
    
    # Convert prices
    for col in ['open', 'high', 'low', 'close', 'volume']:
        df[col] = pd.to_numeric(df[col])
    
    # Sort chronologically  
    df = df.sort_values('open_time').reset_index(drop=True)
    
    # Save to CSV
    output_file = "btcusdt_6months.csv"
    print(f"💾 Saving to {output_file}...")
    df.to_csv(output_file, index=False)
    
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    days = (df['open_time'].max() - df['open_time'].min()).days
    
    print(f"\n✅ SUCCESS!")
    print(f"📁 File: {output_file} ({file_size:.1f} MB)")
    print(f"📊 Records: {len(df):,} hours")
    print(f"📅 From: {df['open_time'].min()}")
    print(f"📅 To: {df['open_time'].max()}")
    print(f"📈 Days: {days}")
    print(f"💰 Price: ${df['low'].min():,.0f} - ${df['high'].max():,.0f}")
    print(f"💰 Latest: ${df['close'].iloc[-1]:,.0f}")
    
    print(f"\n🎯 6 MONTHS OF DATA READY FOR BACKTESTING! 🚀")
    
    return df

if __name__ == "__main__":
    get_btcusdt_6_months()