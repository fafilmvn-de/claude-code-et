#!/usr/bin/env python3
"""
FINAL: Get ALL BTCUSDT hourly data efficiently
Based on successful sample test
"""

import pandas as pd
import requests
import time
from datetime import datetime
import os

def get_all_btcusdt_final():
    """Get ALL BTCUSDT data efficiently - final version"""
    
    print("🚀 FINAL CRAWLER: Getting ALL BTCUSDT hourly data")
    print("=" * 60)
    
    # BTCUSDT started trading on Binance around August 17, 2017
    # Let's be conservative and start from August 1, 2017
    start_date = datetime(2017, 8, 1)
    start_timestamp = int(start_date.timestamp() * 1000)
    
    print(f"📅 Starting from: {start_date}")
    print(f"📊 Getting 1000 records per batch...")
    
    all_data = []
    batch_count = 0
    current_start_time = start_timestamp
    
    total_start_time = time.time()
    
    while True:
        batch_count += 1
        
        params = {
            'symbol': 'BTCUSDT',
            'interval': '1h', 
            'limit': 1000,
            'startTime': current_start_time
        }
        
        batch_date = datetime.fromtimestamp(current_start_time / 1000)
        print(f"📦 Batch {batch_count}: {batch_date.strftime('%Y-%m-%d %H:%M')}", end=" ")
        
        batch_start_time = time.time()
        
        try:
            response = requests.get("https://api.binance.com/api/v3/klines", params=params, timeout=30)
            
            batch_time = time.time() - batch_start_time
            
            if response.status_code == 429:  # Rate limit
                print(f"⏳ Rate limited - waiting 60s...")
                time.sleep(60)
                continue
                
            if response.status_code != 200:
                print(f"❌ Error {response.status_code}")
                break
            
            data = response.json()
            
            if not data or len(data) == 0:
                print("✅ No more data - finished!")
                break
            
            all_data.extend(data)
            total_records = len(all_data)
            
            print(f"✅ +{len(data)} records ({batch_time:.2f}s) | Total: {total_records:,}")
            
            # Update start time to get next batch
            last_close_time = data[-1][6]  # Close time of last candle
            current_start_time = last_close_time + 1  # Next millisecond
            
            # Progress update every 10 batches
            if batch_count % 10 == 0:
                elapsed = time.time() - total_start_time
                total_days = total_records / 24
                print(f"   📊 Progress: {total_records:,} hours ({total_days:.0f} days) in {elapsed:.1f}s")
            
            # Small delay to be nice to API
            time.sleep(0.1)
            
        except Exception as e:
            print(f"❌ Batch error: {e}")
            time.sleep(5)
            continue
    
    total_time = time.time() - total_start_time
    
    if not all_data:
        print("❌ No data collected!")
        return None
    
    print(f"\n🎉 DATA COLLECTION COMPLETE!")
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
    
    # Remove duplicates and sort
    print(f"🔧 Removing duplicates and sorting...")
    original_count = len(df)
    df = df.drop_duplicates(subset=['open_time']).sort_values('open_time').reset_index(drop=True)
    final_count = len(df)
    
    if original_count != final_count:
        print(f"   🧹 Removed {original_count - final_count} duplicates")
    
    # Save to CSV
    output_file = "btcusdt_COMPLETE_ALL_DATA.csv"
    print(f"\n💾 Saving to {output_file}...")
    
    df.to_csv(output_file, index=False)
    
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    
    # Final summary
    time_span = (df['open_time'].max() - df['open_time'].min()).days
    
    print(f"\n🏆 COMPLETE SUCCESS!")
    print(f"📁 File: {output_file}")
    print(f"💾 Size: {file_size:.1f} MB") 
    print(f"📊 Records: {len(df):,}")
    print(f"📅 From: {df['open_time'].min()}")
    print(f"📅 To: {df['open_time'].max()}")
    print(f"⏰ Time span: {time_span:,} days")
    print(f"💰 Price range: ${df['low'].min():,.2f} - ${df['high'].max():,.2f}")
    print(f"💰 Latest price: ${df['close'].iloc[-1]:,.2f}")
    print(f"📈 Total BTC volume: {df['volume'].sum():,.0f}")
    
    # Show data sample
    print(f"\n📋 Data sample (first 5 rows):")
    print(df[['open_time', 'open', 'high', 'low', 'close', 'volume']].head())
    
    print(f"\n🎯🎯🎯 ALL DATA READY FOR BACKTESTING! 🚀🚀🚀")
    
    return df

if __name__ == "__main__":
    get_all_btcusdt_final()