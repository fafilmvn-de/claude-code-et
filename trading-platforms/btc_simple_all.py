#!/usr/bin/env python3
"""
Simple but effective ALL data crawler with immediate progress feedback
"""

import pandas as pd
import requests
import time
from datetime import datetime
import os

def get_all_btcusdt_data():
    """Get ALL BTCUSDT hourly data with immediate feedback"""
    
    print("🚀 Getting ALL BTCUSDT data - Starting NOW!")
    
    base_url = "https://api.binance.com"
    symbol = "BTCUSDT"
    interval = "1h"
    limit = 1000
    
    all_data = []
    
    # Start from August 17, 2017 (BTCUSDT launch date)
    start_date = datetime(2017, 8, 17)
    start_timestamp = int(start_date.timestamp() * 1000)
    
    print(f"📅 Starting from: {start_date}")
    print(f"📊 Getting batches of {limit} hours each...")
    
    batch_count = 0
    current_start = start_timestamp
    
    while True:
        batch_count += 1
        
        params = {
            'symbol': symbol,
            'interval': interval,
            'limit': limit,
            'startTime': current_start
        }
        
        print(f"\n📦 Batch {batch_count}: {datetime.fromtimestamp(current_start/1000)}")
        
        try:
            response = requests.get(f"{base_url}/api/v3/klines", params=params, timeout=30)
            
            if response.status_code == 429:
                print("   ⏳ Rate limited - waiting 60s...")
                time.sleep(60)
                continue
                
            response.raise_for_status()
            data = response.json()
            
            if not data or len(data) == 0:
                print(f"   ✅ No more data - finished!")
                break
                
            print(f"   📈 Got {len(data)} records")
            all_data.extend(data)
            
            # Update start time for next batch
            last_close_time = data[-1][6]  # Close time of last record
            current_start = last_close_time + 1
            
            total_records = len(all_data)
            total_days = total_records / 24
            
            if batch_count % 10 == 0:
                print(f"\n📊 Progress: {total_records:,} hours ({total_days:.1f} days) collected")
            
            # Small delay to be nice to API
            time.sleep(0.1)
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            time.sleep(5)
            continue
    
    print(f"\n🎉 Collection complete!")
    print(f"📊 Total records: {len(all_data):,}")
    
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
    
    # Convert numeric columns
    price_cols = ['open', 'high', 'low', 'close', 'volume', 
                 'quote_asset_volume', 'taker_buy_base_asset_volume', 
                 'taker_buy_quote_asset_volume']
    
    for col in price_cols:
        df[col] = pd.to_numeric(df[col])
    
    df['number_of_trades'] = pd.to_numeric(df['number_of_trades'])
    
    # Sort by time
    df = df.sort_values('open_time').reset_index(drop=True)
    
    # Save to CSV
    output_file = "btcusdt_ALL_DATA.csv"
    print(f"💾 Saving to {output_file}...")
    df.to_csv(output_file, index=False)
    
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    
    print(f"\n✅ SUCCESS!")
    print(f"📁 File: {output_file}")
    print(f"📊 Size: {file_size:.1f} MB")
    print(f"📈 Records: {len(df):,}")
    print(f"📅 From: {df['open_time'].min()}")
    print(f"📅 To: {df['open_time'].max()}")
    print(f"💰 Price range: ${df['low'].min():.2f} - ${df['high'].max():.2f}")
    print(f"💰 Latest price: ${df['close'].iloc[-1]:.2f}")
    
    print(f"\n🎯 ALL DATA READY FOR BACKTESTING! 🚀")
    
    return df

if __name__ == "__main__":
    get_all_btcusdt_data()