#!/usr/bin/env python3
"""
BACKWARDS CRAWLER: Work from NOW backwards to get ALL data
Since we know recent data requests work perfectly
"""

import pandas as pd
import requests
import time
from datetime import datetime, timedelta
import os

def get_all_btcusdt_backwards():
    """Get ALL data by working backwards from now"""
    
    print("🔄 BACKWARDS CRAWLER: Starting from NOW, going back to 2017")
    print("=" * 60)
    
    all_data = []
    batch_count = 0
    
    # Start from current time and work backwards
    current_end_time = None  # None means "latest available"
    
    total_start_time = time.time()
    
    while True:
        batch_count += 1
        
        # Build request parameters
        params = {
            'symbol': 'BTCUSDT',
            'interval': '1h',
            'limit': 1000
        }
        
        # If we have an end time, use it
        if current_end_time:
            params['endTime'] = current_end_time
            end_date = datetime.fromtimestamp(current_end_time / 1000)
            print(f"📦 Batch {batch_count}: ending at {end_date.strftime('%Y-%m-%d %H:%M')}", end=" ")
        else:
            print(f"📦 Batch {batch_count}: latest data", end=" ")
        
        batch_start_time = time.time()
        
        try:
            response = requests.get("https://api.binance.com/api/v3/klines", params=params, timeout=30)
            
            batch_time = time.time() - batch_start_time
            
            if response.status_code == 429:  # Rate limit
                print(f"⏳ Rate limited - waiting 30s...")
                time.sleep(30)
                continue
                
            if response.status_code != 200:
                print(f"❌ Error {response.status_code}")
                break
            
            data = response.json()
            
            if not data or len(data) == 0:
                print("✅ No more data - reached the beginning!")
                break
            
            # Check if we've hit the earliest available data (around Aug 2017)
            earliest_time = datetime.fromtimestamp(data[0][0] / 1000)
            if earliest_time.year < 2017 or (earliest_time.year == 2017 and earliest_time.month < 8):
                print("✅ Reached earliest BTCUSDT data!")
                all_data.extend(data)
                break
            
            all_data.extend(data)
            total_records = len(all_data)
            
            print(f"✅ +{len(data)} records ({batch_time:.2f}s) | Total: {total_records:,}")
            
            # Set next end time to be 1ms before the first record of this batch
            first_open_time = data[0][0]  # Open time of first candle in this batch
            current_end_time = first_open_time - 1  # Go back further
            
            # Progress update every 10 batches
            if batch_count % 10 == 0:
                elapsed = time.time() - total_start_time
                total_days = total_records / 24
                first_date = datetime.fromtimestamp(data[0][0] / 1000)
                print(f"   📊 Progress: {total_records:,} hours ({total_days:.0f} days) | Now at: {first_date.strftime('%Y-%m-%d')} | {elapsed:.1f}s")
            
            # Small delay 
            time.sleep(0.1)
            
        except Exception as e:
            print(f"❌ Batch error: {e}")
            time.sleep(5)
            continue
    
    total_time = time.time() - total_start_time
    
    if not all_data:
        print("❌ No data collected!")
        return None
    
    print(f"\n🎉 BACKWARDS CRAWL COMPLETE!")
    print(f"⏰ Total time: {total_time:.1f} seconds")
    print(f"📊 Batches: {batch_count}")
    print(f"📈 Records: {len(all_data):,}")
    
    # Convert to DataFrame
    print(f"\n📝 Converting to DataFrame...")
    
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
                 'taker_buy_quote_asset_volume', 'number_of_trades']
    
    for col in price_cols:
        df[col] = pd.to_numeric(df[col])
    
    # Remove duplicates and sort (IMPORTANT: sort chronologically)
    print(f"🔧 Removing duplicates and sorting chronologically...")
    original_count = len(df)
    df = df.drop_duplicates(subset=['open_time']).sort_values('open_time').reset_index(drop=True)
    final_count = len(df)
    
    if original_count != final_count:
        print(f"   🧹 Removed {original_count - final_count} duplicates")
    
    # Save to CSV
    output_file = "btcusdt_ALL_BACKWARDS.csv"
    print(f"\n💾 Saving to {output_file}...")
    
    df.to_csv(output_file, index=False)
    
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    
    # Final summary
    time_span = (df['open_time'].max() - df['open_time'].min()).days
    
    print(f"\n🏆 BACKWARDS CRAWL SUCCESS!")
    print(f"📁 File: {output_file}")
    print(f"💾 Size: {file_size:.1f} MB") 
    print(f"📊 Records: {len(df):,}")
    print(f"📅 From: {df['open_time'].min()}")
    print(f"📅 To: {df['open_time'].max()}")
    print(f"⏰ Time span: {time_span:,} days")
    print(f"💰 Price range: ${df['low'].min():,.2f} - ${df['high'].max():,.2f}")
    print(f"💰 Latest price: ${df['close'].iloc[-1]:,.2f}")
    print(f"📈 Total BTC volume: {df['volume'].sum():,.0f}")
    
    print(f"\n🎯🎯🎯 ALL BTCUSDT DATA READY FOR BACKTESTING! 🚀🚀🚀")
    
    return df

if __name__ == "__main__":
    get_all_btcusdt_backwards()