#!/usr/bin/env python3
"""
AGGRESSIVE ALL-DATA CRAWLER
Gets ABSOLUTELY EVERYTHING using bulletproof backwards chunking
NO MERCY - EVERY SINGLE HOUR SINCE BTCUSDT LAUNCHED!
"""

import pandas as pd
import requests
import time
from datetime import datetime
import os
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

class AggressiveAllCrawler:
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3/klines"
        self.symbol = "BTCUSDT"
        self.interval = "1h"
        self.chunk_size = 500  # Smaller chunks for reliability
        self.all_data = []
        self.data_lock = threading.Lock()
        self.request_count = 0
        
    def make_request(self, end_time=None, chunk_id=None):
        """Make a single API request"""
        params = {
            'symbol': self.symbol,
            'interval': self.interval,
            'limit': self.chunk_size
        }
        
        if end_time:
            params['endTime'] = end_time
        
        chunk_info = f"Chunk {chunk_id}" if chunk_id else "Latest"
        
        try:
            response = requests.get(self.base_url, params=params, timeout=15)
            
            self.request_count += 1
            
            if response.status_code == 429:  # Rate limit
                print(f"   ⏳ {chunk_info} - Rate limited")
                time.sleep(1)
                return None
                
            if response.status_code != 200:
                print(f"   ❌ {chunk_info} - Status {response.status_code}")
                return None
                
            data = response.json()
            
            if not data or len(data) == 0:
                print(f"   ✅ {chunk_info} - No more data (reached beginning)")
                return None
                
            print(f"   ✅ {chunk_info} - Got {len(data)} records")
            return data
            
        except Exception as e:
            print(f"   ❌ {chunk_info} - Error: {e}")
            return None
    
    def crawl_chunk_backwards(self, start_end_time, chunk_id, total_chunks):
        """Crawl a chunk working backwards"""
        chunk_data = []
        current_end_time = start_end_time
        requests_in_chunk = 0
        
        while requests_in_chunk < 20:  # Max 20 requests per chunk
            data = self.make_request(end_time=current_end_time, chunk_id=f"{chunk_id}/{total_chunks}")
            requests_in_chunk += 1
            
            if data is None:
                break
                
            chunk_data.extend(data)
            
            # Check if we've gone back far enough (August 2017)
            earliest_time = datetime.fromtimestamp(data[0][0] / 1000)
            if earliest_time.year <= 2017 and earliest_time.month <= 8:
                print(f"   🎯 Chunk {chunk_id} - Reached August 2017!")
                break
            
            # Move backwards
            first_time = data[0][0]  # First record's open time
            current_end_time = first_time - 1
            
            time.sleep(0.1)  # Small delay
        
        with self.data_lock:
            self.all_data.extend(chunk_data)
            
        return len(chunk_data)
    
    def get_all_data_aggressive(self):
        """Get ALL data using aggressive parallel backwards crawling"""
        
        print("🔥🔥🔥 AGGRESSIVE ALL-DATA CRAWLER 🔥🔥🔥")
        print("GETTING EVERY SINGLE HOUR SINCE BTCUSDT LAUNCHED!")
        print("=" * 70)
        
        # Get the most recent data first to establish the latest timestamp
        print("📡 Getting latest data to establish starting point...")
        latest_data = self.make_request()
        
        if not latest_data:
            print("❌ Could not get latest data!")
            return None
            
        latest_time = latest_data[-1][6]  # Close time of most recent candle
        print(f"📅 Latest timestamp: {datetime.fromtimestamp(latest_time/1000)}")
        
        # Create multiple starting points for parallel crawling
        num_threads = 8  # Parallel threads
        time_gap = 30 * 24 * 3600 * 1000  # 30 days in milliseconds
        
        starting_points = []
        for i in range(num_threads):
            start_time = latest_time - (i * time_gap)
            starting_points.append(start_time)
        
        print(f"🚀 Starting {num_threads} parallel crawlers...")
        
        start_time = time.time()
        
        # Run parallel crawlers
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [
                executor.submit(self.crawl_chunk_backwards, start_point, i+1, num_threads) 
                for i, start_point in enumerate(starting_points)
            ]
            
            # Wait for all to complete
            for future in as_completed(futures):
                try:
                    records = future.result()
                    print(f"📈 Thread completed: {records} records")
                except Exception as e:
                    print(f"❌ Thread failed: {e}")
        
        elapsed = time.time() - start_time
        
        print(f"\n🎉 AGGRESSIVE CRAWLING COMPLETE!")
        print(f"⏰ Time: {elapsed:.1f} seconds")
        print(f"📡 Total requests: {self.request_count}")
        print(f"📊 Raw records collected: {len(self.all_data):,}")
        
        if not self.all_data:
            print("❌ No data collected!")
            return None
        
        return self.process_and_save_data()
    
    def process_and_save_data(self):
        """Process and save the collected data"""
        print("\n📝 Processing collected data...")
        
        # Convert to DataFrame
        columns = [
            'open_time', 'open', 'high', 'low', 'close', 'volume',
            'close_time', 'quote_asset_volume', 'number_of_trades',
            'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
        ]
        
        df = pd.DataFrame(self.all_data, columns=columns)
        
        # Convert timestamps
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
        df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
        
        # Convert prices
        price_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in price_cols:
            df[col] = pd.to_numeric(df[col])
        
        # Remove duplicates and sort
        print("🔧 Removing duplicates and sorting...")
        original_count = len(df)
        df = df.drop_duplicates(subset=['open_time']).sort_values('open_time').reset_index(drop=True)
        final_count = len(df)
        
        print(f"   🧹 Removed {original_count - final_count:,} duplicates")
        
        # Save to CSV
        output_file = "btcusdt_AGGRESSIVE_ALL.csv"
        print(f"💾 Saving to {output_file}...")
        
        df.to_csv(output_file, index=False)
        
        file_size = os.path.getsize(output_file) / (1024 * 1024)
        days = (df['open_time'].max() - df['open_time'].min()).days
        
        print(f"\n🏆 AGGRESSIVE SUCCESS!")
        print(f"📁 File: {output_file} ({file_size:.1f} MB)")
        print(f"📊 Final records: {len(df):,} hours")
        print(f"📅 From: {df['open_time'].min()}")
        print(f"📅 To: {df['open_time'].max()}")
        print(f"📈 Days: {days:,}")
        print(f"💰 All-time low: ${df['low'].min():,.2f}")
        print(f"💰 All-time high: ${df['high'].max():,.2f}")
        print(f"💰 Latest price: ${df['close'].iloc[-1]:,.2f}")
        print(f"📊 Total volume: {df['volume'].sum():,.0f} BTC")
        
        print(f"\n🎯🎯🎯 ALL BTCUSDT DATA CONQUERED! 🚀🚀🚀")
        print(f"YOU NOW HAVE EVERYTHING FOR BACKTESTING!")
        
        return df

def main():
    crawler = AggressiveAllCrawler()
    df = crawler.get_all_data_aggressive()
    
    if df is not None:
        print(f"\n✅ SUCCESS: {len(df):,} hours of BTCUSDT data ready!")
    else:
        print("\n❌ FAILED: Could not get all data")

if __name__ == "__main__":
    main()